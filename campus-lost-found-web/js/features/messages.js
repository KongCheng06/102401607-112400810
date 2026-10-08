/* ================= 消息中心 ================= */
const MESSAGES = [
  {bg:'#E3EFE4', color:'#5E9E74', svg:'<path d="M20 6 9 17l-5-5"/>', t:'有人对你的「校园卡（尾号2076）」发起了联系', d:'对方称在图书馆三楼见过相似卡片，点击查看', time:'2分钟前', itemId:2},
  {bg:'#E3EFE4', color:'#5E9E74', svg:'<path d="M20 6 9 17l-5-5"/>', t:'你发布的「浅蓝色自动雨伞」已标记完成', d:'物品已归还，感谢你的善举', time:'昨天', itemId:8},
  {bg:'#F8E9DF', color:'#D97D52', svg:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', t:'京元餐厅有一条新的招领信息', d:'可能与你关注的物品有关，点击查看', time:'2天前', itemId:1},
  {bg:'#E4EEF8', color:'#5B8DB8', svg:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>', t:'欢迎使用校园失物招领', d:'发布寻物 / 招领信息，让失物更快回家', time:'3天前', itemId:null}
];
function renderMessages(){
  $('msg-list').innerHTML = MESSAGES.map(m=>
    `<div class="msg-card" onclick="openMsg(${m.itemId===null?'null':m.itemId})">
      <span class="msg-ic" style="background:${m.bg};color:${m.color};">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${m.svg}</svg>
      </span>
      <div class="msg-body">
        <div class="msg-t">${m.t}</div>
        <div class="msg-d">${m.d}</div>
      </div>
      <span class="msg-time">${m.time}</span>
    </div>`).join('');
}
function openMsg(itemId){
  if(itemId===null){ toast('系统消息'); return; }
  goDetail(itemId);
}

