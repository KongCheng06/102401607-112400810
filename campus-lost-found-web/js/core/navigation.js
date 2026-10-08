/* ================= 路由 ================= */
let pageStack = ['page-home'];
const $ = id => document.getElementById(id);

function showPage(id, anim){
  const page = $(id);
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active','slide-in','slide-back','fade-in'));
  page.classList.add('active');
  if(anim==='slide') page.classList.add('slide-in');
  else if(anim==='fade') page.classList.add('fade-in');
}
function navigate(id, anim){
  pageStack.push(id);
  showPage(id, anim||'slide');
}
function backPage(){
  if(pageStack.length<=1){ switchTab('home'); return; }
  const cur = pageStack.pop();
  const target = pageStack[pageStack.length-1];
  const curPage = $(cur);
  curPage.classList.add('slide-back');
  document.querySelectorAll('.page').forEach(p=>{ if(p.id===target) p.classList.add('active'); });
  setTimeout(()=>{ curPage.classList.remove('active','slide-back'); },280);
}
function switchTab(name){
  pageStack = ['page-'+name];
  showPage('page-'+name,'fade');
  if(name==='mine') renderMine();
  if(name==='home') renderHome();
}
function goPublish(){ resetPublishForm(); navigate('page-publish','slide'); }
function goPublishTyped(type){
  resetPublishForm();
  selectPubType(type);
  navigate('page-publish','slide');
}
function goSearch(){
  renderSearchGuide();
  navigate('page-search','slide');
  setTimeout(function(){ $('search-input').focus(); }, 320);
}
function goMap(){ navigate('page-map','slide'); }
function openMapZoom(e){
  $('map-zoom-mask').classList.add('show');
  var m=$('mz-scroll');
  var px=.5, py=.3;
  if(e&&e.currentTarget){
    var r=e.currentTarget.getBoundingClientRect();
    px=(e.clientX-r.left)/r.width;
    py=(e.clientY-r.top)/r.height;
  }
  setTimeout(function(){
    m.scrollLeft=px*m.scrollWidth-m.clientWidth/2;
    m.scrollTop=py*m.scrollHeight-m.clientHeight/2;
  },80);
}
function closeMapZoom(){ $('map-zoom-mask').classList.remove('show'); }
function quickPlace(p){
  $('search-input').value=p;
  doSearch();
  $('search-input').blur();
  navigate('page-search','slide');
}
function goDetail(id){
  currentDetailId = id;
  renderDetail(id);
  var dc=document.querySelector('#page-detail .content');
  if(dc) dc.scrollTop=0;
  navigate('page-detail','slide');
}
function goCategory(kw){
  $('search-input').value=kw;
  doSearch();
  $('search-input').blur();
  navigate('page-search','slide');
}
function goMessages(){ renderMessages(); navigate('page-message','slide'); }
function goInfoList(){ showAllAsResult(); navigate('page-search','slide'); }
function showAllAsResult(){
  $('search-guide').style.display='none';
  $('search-result').style.display='block';
  $('search-input').value=''; $('search-input').blur();
  $('result-head').innerHTML = '全部信息 · 共 <b>'+DATA.length+'</b> 条';
  $('result-list').innerHTML = DATA.map(cardHTML).join('');
}

/* ================= Toast ================= */
let toastTimer;
function toast(msg, ms){
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), ms||1800);
}

/* ================= 卡片渲染 ================= */
function cardHTML(item){
  const isLost = item.type==='lost';
  const done = item.status==='done';
  const thumb = item.img
    ? `<div class="info-thumb ${done?'thumb-done':''}"><img src="${item.img}" alt=""></div>`
    : `<div class="info-thumb ${isLost?'thumb-lost':'thumb-found'} ${done?'thumb-done':''}">${item.emoji}</div>`;
  return `<div class="info-card" onclick="goDetail(${item.id})">
    ${thumb}
    <div class="info-main">
      <div class="info-tags">
        <span class="tag-type ${isLost?'tag-lost':'tag-found'}">${isLost?'寻物':'招领'}</span>
        ${done?'<span class="tag-status done">已完成</span>':'<span class="tag-status">进行中</span>'}
        ${isLost&&item.reward>0?'<span class="tag-reward">悬赏 ¥'+item.reward+'</span>':''}
      </div>
      <div class="info-name">${item.name}</div>
      <div class="info-sub">${item.place} · ${item.pubTime}</div>
    </div>
    <span class="card-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span>
  </div>`;
}
function contactItem(id){
  const it = DATA.find(x=>x.id===id);
  if(!it) return;
  toast((it.type==='lost'?'失主':'拾主')+'联系方式：'+it.contact);
}
function emptyHTML(msg){
  return `<div class="empty">
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></svg>
    <p>${msg}</p></div>`;
}

/* ================= 首页 ================= */
let homeSeg = 'all';
function renderHome(){
  const list = DATA.filter(d=>{
    if(homeSeg==='all') return true;
    if(homeSeg==='reward') return d.reward>0;
    return d.type===homeSeg;
  });
  const wrap = $('home-list');
  wrap.innerHTML = list.length ? list.map(cardHTML).join('') : emptyHTML('暂时没有相关信息');
}
function switchSeg(seg){
  homeSeg = seg;
  document.querySelectorAll('#page-home .mf-pill').forEach(b=>b.classList.toggle('on',b.dataset.seg===seg));
  renderHome();
}

