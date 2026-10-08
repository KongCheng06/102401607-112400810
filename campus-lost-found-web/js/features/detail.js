/* ================= 详情页 ================= */
let currentDetailId = null;
function renderDetail(id){
  const d = DATA.find(x=>x.id===id);
  if(!d){ toast('信息不存在'); backPage(); return; }
  const isLost = d.type==='lost';
  const done = d.status==='done';
  $('d-hero').className = 'detail-hero '+(isLost?'hero-lost':'hero-found');
  const heroImg=$('d-hero-img');
  if(d.img){
    heroImg.src=d.img; heroImg.style.display='block';
    $('d-emoji').style.display='none';
  }else{
    heroImg.style.display='none'; heroImg.removeAttribute('src');
    $('d-emoji').style.display='';
    $('d-emoji').textContent=d.emoji;
  }
  $('d-banner').className = 'detail-type-banner '+(isLost?'banner-lost':'banner-found');
  $('d-banner').innerHTML = (isLost
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg> 寻物启事'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 失物招领');
  $('d-status-banner').textContent = done?'已完成':'进行中';
  $('d-title').textContent = d.name;
  $('d-quick').innerHTML = `<span>${d.category}</span><span>${isLost?'丢失地点：':'捡到地点：'}${d.place}</span>`;
  const rew=$('d-reward');
  if(isLost&&d.reward>0){
    rew.style.display='flex';
    rew.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3"/></svg><span class="dr-main">悬赏 ¥'+d.reward+' 寻物</span><span class="dr-sub">'+(done?'物品已找到，悬赏已兑现':'找回后向热心同学支付')+'</span>';
  }else{ rew.style.display='none'; }
  $('d-type').textContent = isLost?'寻物启事（物品丢失，寻求线索）':'失物招领（捡到物品，寻找失主）';
  $('d-category').textContent = d.category;
  $('d-place-key').textContent = isLost?'丢失地点':'捡到地点';
  $('d-place').textContent = d.place;
  $('d-time-key').textContent = isLost?'丢失时间':'捡到时间';
  $('d-time').textContent = d.time;
  $('d-pubtime').textContent = d.pubTime==='刚刚'?'刚刚发布':d.pubTime;
  $('d-desc').textContent = d.desc;
  var av=$('d-avatar');
  av.classList.toggle('is-mine',!!d.mine);
  av.querySelector('.av-text').textContent=d.publisher.slice(0,1);
  $('d-pubname').textContent = d.mine?'我（'+d.dept+'）':d.publisher;
  $('d-pubdept').textContent = d.dept;
  // 智能匹配模块
  const matchSec=$('d-match-section');
  if(d.matches && d.matches.length){
    $('d-match-count').textContent=d.matches.length+' 条';
    $('d-match-list').innerHTML=d.matches.map(m=>{
      const o=DATA.find(x=>x.id===m.id);
      if(!o) return '';
      const oImg=o.img?('<img class="m-item-img" src="'+o.img+'">'):('<span class="m-item-emoji">'+o.emoji+'</span>');
      return '<div class="match-card">'+
        '<div class="m-item"><span class="m-item-thumb">'+oImg+'</span>'+
          '<div class="m-item-info"><div class="m-item-name">'+o.name+'</div>'+
          '<div class="m-item-place">'+o.place+' · '+o.pubTime+'</div></div>'+
          '<span class="m-score">'+m.score+'%</span></div>'+
        '<div class="m-reasons">'+m.reasons.map(r=>'<span>'+r+'</span>').join('')+'</div>'+
        '<div class="m-actions"><button class="m-btn view" onclick="goDetail('+o.id+')">查看详情</button>'+
        '<button class="m-btn contact" onclick="goChat('+o.id+')">联系'+(o.mine?'我':'TA')+'</button></div></div>';
    }).join('');
    matchSec.style.display='block';
  } else {
    matchSec.style.display='none';
  }
  // 底部操作区
  const ft = $('d-footer');
  if(d.mine && !done){
    ft.innerHTML = `<button class="status-btn" onclick="markDone(${d.id})">
      ${isLost?'我已找到物品，标记完成':'物品已归还失主，标记完成'}</button>`;
  } else if(d.mine && done){
    ft.innerHTML = d.thanked
      ? `<button class="status-btn" style="background:#EFEEE8;color:var(--ink-3);" disabled>${isLost?'物品已找到 · 感谢信已发送':'物品已归还 · 已收到感谢信'}</button>`
      : `<button class="status-btn thanks-act" onclick="openThanks(${d.id})">${isLost?'写感谢信感谢拾主':'查看失主给你的感谢信'}</button>`;
  } else {
    ft.innerHTML = `
      <button class="contact-btn call" onclick="toast('正在拨打对方电话…（原型演示）')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>
        电话联系</button>
      <button class="contact-btn chat" onclick="goChat(${d.id})">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20l1-4.6A8.4 8.4 0 1 1 21 11.5Z"/></svg>
        站内联系</button>`;
  }
}
