/* ================= 站内聊天 ================= */
let currentChatId=null;
let chatLog=[];
let chatTimer=null;
function goChat(id){
  const d=DATA.find(x=>x.id===id);
  if(!d) return;
  currentChatId=id;
  const navAv=$('chat-nav-avatar');
  navAv.classList.toggle('is-mine',!!d.mine);
  navAv.querySelector('.cnav-text').textContent=d.publisher.slice(0,1);
  $('chat-nav-name').textContent=d.mine?'我':d.publisher;
  $('chat-tip').textContent=(d.mine?'我':d.publisher)+' · '+(d.type==='lost'?'寻物启事':'失物招领')+' · 站内消息为原型演示';
  chatLog=[];
  if(d.type==='found'){
    chatLog.push({from:'other',text:'你好，我捡到了「'+d.name+'」，看到你在找，请问是你的吗？'});
    chatLog.push({from:'me',text:'你好，麻烦你了，我先确认一下物品细节'});
    chatLog.push({from:'other',text:'好的，你描述一下，我核对一下物品特征'});
  }else if(d.mine){
    chatLog.push({from:'other',text:'你好，关于「'+d.name+'」，我看到你发布的信息，想了解一下'});
    chatLog.push({from:'me',text:'好的，你说，我帮忙核对'});
  }else{
    chatLog.push({from:'me',text:'你好，关于「'+d.name+'」，我看到你发布的信息，想了解一下'});
    chatLog.push({from:'other',text:'好的，你说，我帮忙核对'});
  }
  renderChat();
  $('chat-input').value='';
  navigate('page-chat','slide');
  setTimeout(scrollChatBottom,360);
}
function renderChat(){
  const d=DATA.find(x=>x.id===currentChatId);
  const avChar=d?(d.mine?'同':d.publisher.slice(0,1)):'同';
  $('chat-msgs').innerHTML=chatLog.map(function(m){
    if(m.from==='me'){
      return '<div class="msg-row me"><div class="msg-bubble"></div><div class="msg-avatar me-av"></div></div>';
    }
    return '<div class="msg-row other"><div class="msg-avatar">'+avChar+'</div><div class="msg-bubble"></div></div>';
  }).join('');
  const rows=$('chat-msgs').querySelectorAll('.msg-row');
  chatLog.forEach(function(m,i){
    rows[i].querySelector('.msg-bubble').textContent=m.text;
  });
}
function sendChat(){
  const inp=$('chat-input');
  const txt=inp.value.trim();
  if(!txt) return;
  chatLog.push({from:'me',text:txt});
  inp.value='';
  renderChat();
  scrollChatBottom();
  if(chatTimer) clearTimeout(chatTimer);
  chatTimer=setTimeout(function(){
    chatLog.push({from:'other',text:botReply(txt)});
    renderChat();
    scrollChatBottom();
  },900+Math.random()*700);
}
function scrollChatBottom(){
  const b=$('chat-body');
  b.scrollTop=b.scrollHeight;
}
function botReply(t){
  const replies=[
    '好的，我明白了',
    '方便的话我们约个时间地点交接吧',
    '可以的，谢谢你！',
    '我核对一下，稍后回复你',
    '东西对得上的话就太好了',
    '那我们图书馆门口见？'
  ];
  return replies[Math.floor(Math.random()*replies.length)];
}

