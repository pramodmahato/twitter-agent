function streamNow(key,id){

    console.log('Search for : '+key)
    var stream = client.stream('statuses/filter', {track: '@pramod_mht'});
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
  module.exports.streamNow=streamNow