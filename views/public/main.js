var allData=[]
var firebaseConfig = {
  apiKey: "AIzaSyD2arB0eKXpdqy_vtQ7Nq3PP8ehsjXMliA",
  authDomain: "richpanel-e71c9.firebaseapp.com",
  databaseURL: "https://richpanel-e71c9.firebaseio.com",
  projectId: "richpanel-e71c9",
  storageBucket: "richpanel-e71c9.appspot.com",
  messagingSenderId: "685382152016",
  appId: "1:685382152016:web:0c4851aed033b4f92a0655"
};

function fetchMessage(id){
    for( i in allData){
      if(id==allData[i].id){
          selectedTweetId=allData[i].id_str
          document.getElementById('chatimage1').src=allData[i].userDetails.profile_pic
          document.getElementById('chatimage2').src=allData[i].userDetails.profile_pic
          document.getElementById('user_followers').innerHTML=allData[i].userDetails.followers
          document.getElementById('user_name').innerHTML=allData[i].userDetails.name
          document.getElementById('user_status').innerHTML=allData[i].userDetails.status_count
        document.getElementById('chatname').innerHTML='@'+allData[i].userDetails.screen_name
        document.getElementById('chatdate').innerHTML=allData[i].created_at

        addChat(allData[i].userDetails.profile_pic,allData[i].text,allData[i].created_at,'fetch')
      }
    }
  }
  function send(){
      let src='static/user.png'
      let msg=document.getElementById('msg_text').value;
        let date=new Date()
        addChat(src,msg,date,'reply')
  }
  function addChat(src,text,date,type){
  
   let tab=document.getElementById('chattable')
   if(type!='reply'){
    tab.innerHTML=""
   }
   let tr=document.createElement('tr')
   let td1=document.createElement('td')
   let img=document.createElement('img')
   let td2=document.createElement('td')
   let td3=document.createElement('td')
   tab.appendChild(tr)
   tr.appendChild(td1)
   td1.appendChild(img)
   tr.appendChild(td2)
   tr.appendChild(td3)
   img.setAttribute('src',src)
   img.setAttribute('class','chats-img')
   td2.setAttribute('class','chats-msg')
   td2.innerHTML=text
   td3.setAttribute('class','chats-date')
   td3.innerHTML=date
  }
  function addItem(item){
    let parent=document.getElementById('parent');
    let pitem=document.createElement('div');
    let pimg=document.createElement('div');
    let img=document.createElement('img');
    let pd=document.createElement('div');
    let pname=document.createElement('p');
    let text=document.createElement('p');
  
    parent.appendChild(pitem)
    pitem.appendChild(pimg)
    pimg.appendChild(img)
    pitem.appendChild(pd)
    pd.appendChild(pname)
    pd.appendChild(text)
  
    pitem.setAttribute('class','parent-item')
    pitem.setAttribute('id',`${item.id}`)
    pitem.setAttribute('onclick',`fetchMessage(${item.id})`)
    pimg.setAttribute('class','parent-img')
    img.setAttribute('src',`${item.userDetails.profile_pic}`)
    img.setAttribute('height','25px')
    img.setAttribute('width','25px')
    img.setAttribute('style','border-radius: 50%;margin-top: 5px;margin-left: 5px;')
    pd.setAttribute('class','parent-data')
    pname.setAttribute('style','font-size: 16px;')
    pname.innerHTML=`<b>@${item.userDetails.screen_name}</b>`
    text.setAttribute('style','font-size: 12px;')
    text.innerHTML=`<b>${item.text.substr(0,25)}...</b>`
  }