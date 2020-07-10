const nconf = require('nconf')
const request = require('request')
const queryString = require('query-string')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter')
const httpAuth = require('http-auth')

nconf.file({ file: 'config.json' }).env()

var auth = {}

auth.twitter_oauth = {
  consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
  consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
  token: nconf.get('TWITTER_ACCESS_TOKEN'),
  token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
}
auth.twitter_webhook_environment = nconf.get('TWITTER_WEBHOOK_ENV')

auth.basic = httpAuth.connect(httpAuth.basic({
    realm: 'admin-dashboard'
}, function(username, password, callback) {
    callback(username == nconf.get('BASIC_AUTH_USER') && password == nconf.get('BASIC_AUTH_PASSWORD'))
}))

auth.csrf = require('csurf')()

passport.use(new TwitterStrategy({
    consumerKey: auth.twitter_oauth.consumer_key,
    consumerSecret: auth.twitter_oauth.consumer_secret,
    
    userAuthorizationURL: 'https://api.twitter.com/oauth/authenticate?force_login=true'
  },

  function(token, tokenSecret, profile, cb) {
    return cb(null, {
      profile: profile,
      access_token: token,
      access_token_secret: tokenSecret
    })
  }
))

passport.serializeUser(function(user, cb) {
  cb(null, user);
})

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
})

auth.get_twitter_auth_url = function (host, callback_action) {

  var request_options = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    oauth: {
      callback: 'https://' + host + '/callbacks/twitter/' + callback_action,
      consumer_key: auth.twitter_oauth.consumer_key,
      consumer_secret: auth.twitter_oauth.consumer_secret
    }
  }

  return new Promise (function (resolve, reject) {
    request(request_options, function(error, response) {
      if (error) {
        reject(error)
      }
      else {

        var response_params = queryString.parse(response.body)
        console.log(response_params)
        var twitter_auth_url = 'https://api.twitter.com/oauth/authenticate?force_login=true&oauth_token=' + response_params.oauth_token

        resolve({
          response_params: response_params,
          twitter_auth_url: twitter_auth_url
        })
      }
    })
  })
}

auth.get_twitter_bearer_token = function () {

  if (auth.twitter_bearer_token) {
    return new Promise (function (resolve, reject) {
      resolve(auth.twitter_bearer_token)
    })
  }

  var request_options = {
    url: 'https://api.twitter.com/oauth2/token',
    method: 'POST',
    auth: {
      user: auth.twitter_oauth.consumer_key,
      pass: auth.twitter_oauth.consumer_secret
    },
    form: {
      'grant_type': 'client_credentials'
    }
  }

  return new Promise (function (resolve, reject) {
    request(request_options, function(error, response) {
      if (error) {
        reject(error)
      }
      else {
        var json_body = JSON.parse(response.body)
        console.log("Bearer Token:", json_body.access_token)
        auth.twitter_bearer_token = json_body.access_token
        resolve(auth.twitter_bearer_token)
      }
    })
  })
}


module.exports = auth