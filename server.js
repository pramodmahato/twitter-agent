require('dotenv').config();
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var twitterMentions = require("twitter-mentions")
var twitter=require("twitter")
var firebase = require("firebase");
const Twitter = require('twitter');
var socketIO=require('socket.io')
var http=require('http')

var app = express();


var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();


var trustProxy = false;
if (process.env.DYNO) {
  trustProxy = true;
}
var client;
var screen_name
var tokenwa;

passport.use(new Strategy({
    consumerKey: process.env['TWITTER_CONSUMER_KEY'],
    consumerSecret: process.env['TWITTER_CONSUMER_SECRET'],
    callbackURL: '/twitter/return',
    proxy: trustProxy
  },
  function(token, tokenSecret, profile, cb) {
    tokenwa = {
      consumer_key: process.env['TWITTER_CONSUMER_KEY'],
      consumer_secret: process.env['TWITTER_CONSUMER_SECRET'],
      access_token_key: token,
      access_token_secret: tokenSecret,
      access_token: token,
    }
    client=new Twitter(tokenwa)
    console.log(profile)
    return cb(null, profile);
  }));
 
  function streamNow(key,id){

    console.log('Search for : '+key)
    var stream = client.stream('statuses/filter', {track: key});
  stream.on('data', function(event) {
   
    let data={
    id:event.id,
    created_at:event.created_at,
    id_str:event.id_str,
    text:event.text,
    userDetails:{
      name:event.user.name,
      screen_name:event.user.screen_name,
      profile_pic:event.user.profile_image_url_https,
      status_count:event.user.statuses_count,
      followers:event.user.followers_count,
      description:event.user.description
    },
    user:{
      id: event.user.id,
      id_str: event.user.id_str
    }
    }
  
    firebase.database().ref('tweets/'+id).push(data); 
    
  });
   
  stream.on('error', function(error) {
     console.log(error);
  });
  
  }
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});



let server=http.createServer(app)
let io=socketIO(server)

io.on('connection',(socket)=>{
  console.log('User connected!')
  
  io.on('disconnect',()=>{
    console.log('User disconnected')
  })

  socket.on('reply',(data)=>{
    let res = {
      status: data.msg,
      in_reply_to_status_id: '' + data.id
    };
  
    client.post('statuses/update', res,  function(error, tweet, response) {
      if(error) 
      {
      socket.emit('failed',{error: error})
      }
      else{
        socket.emit('success',{sent: 'sent'}) 
      }
     
    });
    
  })

})

app.use('/static', express.static('views/public'))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/twitter/return',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/profile');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){

    firebase.database().ref('tweets/'+req.user.id).once('value', function(snapshot) {
      var exists = (snapshot.val() !== null);
      if(!exists){
        
    let data=[]
    twitterMentions(tokenwa, '424119506508980224').then(async (mentions) => {
      data=mentions
      for(i in mentions){
        var params = {user_id: mentions[i].user.id_str};
await client.get('users/show', params)
  .then(function (user) {
    let userDetails={
      name: user.name,
      screen_name: user.screen_name,
      description:user.description,
      followers:user.followers_count,
      status_count:user.statuses_count,
      profile_pic:user.profile_image_url_https
    }
    mentions[i].userDetails=userDetails

    firebase.database().ref('tweets/'+req.user.id).push(mentions[i]); 
  })
  .catch(function (error) {
    
    console.log(error)
    throw error

  })
      }

    });}
  });
  res.render('profile', { user: req.user});

  client.get('users/show', {user_id: req.user.id})
  .then(function (user) {
    screen_name= '@'+user.screen_name
    streamNow(screen_name, req.user.id)
  })

  });
  
app.get('/logout',
  function(req, res){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

 
server.listen(process.env.PORT || 8080);
console.log('App started at: '+process.env.port || 8080)
