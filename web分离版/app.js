/* ================= 数据层 ================= */
const EMOJI_MAP = {
  '校园卡证件':'🪪','数码电子':'🎧','钥匙':'🔑','书籍文具':'📚',
  '水杯雨伞':'☂️','衣物配饰':'👓','其他':'📦'
};
const NAME_EMOJI = {'伞':'☂️','耳机':'🎧','校园卡':'🪪','钥匙':'🔑','杯':'🥤','书':'📚','眼镜':'👓','手机':'📱','电脑':'💻','表':'⌚'};

let DATA = [
  {id:1,type:'found',name:'黑色折叠伞一把',category:'水杯雨伞',place:'京元餐厅一楼门口',time:'今天 12:20 左右',
   desc:'中午在京元餐厅吃完饭，在门口伞架上捡到一把黑色折叠伞，伞柄处有一个小挂饰，失主请联系认领。',
   contact:'微信：rainchen98',emoji:'☂️',publisher:'陈同学',dept:'土木工程学院',pubTime:'20分钟前',status:'active',mine:false},
  {id:2,type:'lost',name:'校园卡（尾号2076）',category:'校园卡证件',place:'图书馆三楼文科书库',time:'昨天 15:00-17:00',
   desc:'在图书馆三楼自习后发现校园卡不见了，卡面有蓝色卡套，挂着一个小恐龙钥匙扣，捡到的同学麻烦联系我，非常感谢！',
   contact:'手机：138****6620',emoji:'🪪',publisher:'王同学',dept:'经济与管理学院',pubTime:'1小时前',status:'active',mine:true},
  {id:3,type:'lost',name:'AirPods Pro 2 耳机',category:'数码电子',place:'第一田径场看台',time:'9月25日 傍晚',
   desc:'傍晚在第一田径场跑步后丢失，白色充电盒，盒身有轻微划痕，里面有左耳和右耳，对我很重要，必有重谢！',
   contact:'微信：run_run_233',emoji:'🎧',publisher:'赵同学',dept:'体育教学部',pubTime:'2小时前',status:'active',mine:false},
  {id:4,type:'found',name:'一串钥匙（小熊挂件）',category:'钥匙',place:'西三教学楼 203 教室',time:'今天 09:50 左右',
   desc:'上午第二节课后在西三203教室课桌抽屉里发现一串钥匙，共4把，上面有棕色小熊挂件，失主请说清钥匙数量认领。',
   contact:'微信：keeeys_xu',emoji:'🔑',publisher:'徐同学',dept:'外国语学院',pubTime:'3小时前',status:'active',mine:false},
  {id:5,type:'found',name:'蓝色象印保温杯',category:'水杯雨伞',place:'宏晖文体馆羽毛球区',time:'昨天 20:00 左右',
   desc:'昨晚在宏晖文体馆打完球，在休息区长椅上捡到一个蓝色保温杯，杯底贴有名字贴纸，暂放在文体馆服务台。',
   contact:'手机：159****3301',emoji:'🥤',publisher:'孙同学',dept:'机械工程及自动化学院',pubTime:'昨天',status:'active',mine:false},
  {id:6,type:'lost',name:'黑框近视眼镜',category:'衣物配饰',place:'丁香园食堂二楼',time:'今天 07:40 左右',
   desc:'早上在丁香园二楼吃早餐，摘下眼镜放在桌上忘记拿了，黑色方框，度数较高，没有眼镜很影响上课，求好心人联系。',
   contact:'微信：four_eyes_lin',emoji:'👓',publisher:'林同学',dept:'人文学院',pubTime:'5小时前',status:'active',mine:false},
  {id:7,type:'found',name:'高等数学（第七版）上册',category:'书籍文具',place:'东三教学楼 105 自习室',time:'9月25日 晚',
   desc:'在东三105自习室座位上捡到一本高数教材，书内夹有笔记和一张草稿纸，扉页写有姓氏，现代为保管。',
   contact:'QQ：8720****1',emoji:'📚',publisher:'周同学',dept:'数学与统计学院',pubTime:'2天前',status:'active',mine:false},
  {id:8,type:'found',name:'浅蓝色自动雨伞',category:'水杯雨伞',place:'南门快递中心门口',time:'9月24日 下午',
   desc:'下雨天在南门快递中心门口捡到一把浅蓝色长柄自动伞，已交到快递中心服务台，失主可凭特征描述认领。',
   contact:'微信：umbrella_keep',emoji:'☂️',publisher:'吴同学',dept:'经济与管理学院',pubTime:'3天前',status:'done',mine:true},
  {id:9,type:'lost',name:'粉色自行车钥匙',category:'钥匙',place:'3区学生宿舍停车棚',time:'9月24日 中午',
   desc:'自行车钥匙上有粉色兔子挂件，在3区停车棚附近遗失，车子还锁在那里，急！',
   contact:'手机：186****0945',emoji:'🔑',publisher:'郑同学',dept:'计算机与大数据学院',pubTime:'3天前',status:'active',mine:false},
];
let nextId = 10;

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
function goPublish(){ navigate('page-publish','slide'); resetPublishForm(); }
function goPublishTyped(type){
  navigate('page-publish','slide');
  resetPublishForm();
  selectPubType(type);
}
function goSearch(){ navigate('page-search','slide'); $('search-input').focus(); renderSearchGuide(); }
function goMap(){ navigate('page-map','slide'); }
function openMapZoom(){ $('map-zoom-mask').classList.add('show'); }
function closeMapZoom(){ $('map-zoom-mask').classList.remove('show'); }
function quickPlace(p){
  goSearch();
  setTimeout(function(){ $('search-input').value=p; doSearch(); }, 380);
}
function goDetail(id){
  currentDetailId = id;
  navigate('page-detail','slide');
  renderDetail(id);
}
function goCategory(kw){
  navigate('page-search','slide');
  setTimeout(function(){ $('search-input').value=kw; doSearch(); $('search-input').blur(); }, 380);
}
function goMessages(){ navigate('page-message','slide'); renderMessages(); }
function goInfoList(){ navigate('page-search','slide'); setTimeout(showAllAsResult, 300); }
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
  return `<div class="info-card" onclick="goDetail(${item.id})">
    <div class="info-thumb ${isLost?'thumb-lost':'thumb-found'} ${done?'thumb-done':''}">${item.emoji}</div>
    <div class="info-main">
      <div class="info-tags">
        <span class="tag-type ${isLost?'tag-lost':'tag-found'}">${isLost?'寻物':'招领'}</span>
        ${done?'<span class="tag-status done">已完成</span>':'<span class="tag-status">进行中</span>'}
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
  const list = DATA.filter(d=> homeSeg==='all' ? true : d.type===homeSeg);
  const wrap = $('home-list');
  wrap.innerHTML = list.length ? list.map(cardHTML).join('') : emptyHTML('暂时没有相关信息');
}
function switchSeg(seg){
  homeSeg = seg;
  document.querySelectorAll('#page-home .mf-pill').forEach(b=>b.classList.toggle('on',b.dataset.seg===seg));
  renderHome();
}

/* ================= 发布流程 ================= */
let pubForm = {type:null, category:null, place:null, time:null, images:[]};

function resetPublishForm(){
  pubForm = {type:null, category:null, place:null, time:null, images:[]};
  $('pt-lost').className = 'pub-type-card';
  $('pt-found').className = 'pub-type-card';
  $('f-name').value=''; $('f-desc').value=''; $('f-contact').value='';
  document.querySelectorAll('#f-category .chip').forEach(c=>c.className='chip');
  setPlaceValue(null); setTimeValue(null);
  renderUploads();
}
function selectPubType(type){
  pubForm.type = type;
  $('pt-lost').className = 'pub-type-card'+(type==='lost'?' selected-lost':'');
  $('pt-found').className = 'pub-type-card'+(type==='found'?' selected-found':'');
  $('f-place-label').textContent = type==='lost'?'丢失地点':'捡到地点';
  $('f-time-label').textContent = type==='lost'?'丢失时间':'捡到时间';
  // 分类chip颜色跟随
  document.querySelectorAll('#f-category .chip').forEach(c=>{
    if(c.classList.contains('on-lost')||c.classList.contains('on-found')){
      c.className='chip '+(type==='lost'?'on-lost':'on-found');
    }
  });
}
function selectCategory(el){
  document.querySelectorAll('#f-category .chip').forEach(c=>{
    c.className='chip';
  });
  el.className = 'chip '+(pubForm.type==='found'?'on-found':'on-lost');
  pubForm.category = el.textContent;
}
/* 地点/时间选择弹层 */
const PLACES = ['图书馆','东一教学楼','东二教学楼','东三教学楼','西一教学楼','西二教学楼','西三教学楼','中楼',
 '京元餐厅','丁香园','紫荆园','玫瑰园','教工餐厅','一区学生街',
 '第一田径场','第二田径场','风雨操场','游泳馆','宏晖文体馆','篮球场/网球场',
 '素拓中心','校医院','南门快递中心','1区宿舍','2区宿舍','3区宿舍','4区宿舍','5区宿舍','山北行政楼','其他地点'];
const TIMES = ['今天','昨天','3天内','本周早些时候','记不清了'];
let sheetKind = null;
function openSheet(kind){
  sheetKind = kind;
  $('sheet-title').textContent = kind==='place'?'选择地点':'选择时间';
  const opts = kind==='place'?PLACES:TIMES;
  const cur = kind==='place'?pubForm.place:pubForm.time;
  $('sheet-options').innerHTML = opts.map(o=>
    `<div class="sheet-opt ${o===cur?'sel':''}" onclick="pickSheet('${o}')">
      <span>${o}</span>
      <svg class="opt-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>`).join('');
  $('sheet-mask').className='sheet-mask show';
}
function pickSheet(val){
  if(sheetKind==='place'){ pubForm.place=val; setPlaceValue(val); }
  else { pubForm.time=val; setTimeValue(val); }
  closeSheet();
}
function setPlaceValue(v){
  const el=$('f-place');
  if(v){ el.className='form-value'; el.innerHTML=`<span>${v}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`; }
  else { el.className='form-value placeholder'; el.innerHTML=`<span>请选择或填写地点</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`; }
}
function setTimeValue(v){
  const el=$('f-time');
  if(v){ el.className='form-value'; el.innerHTML=`<span>${v}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`; }
  else { el.className='form-value placeholder'; el.innerHTML=`<span>请选择时间</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`; }
}
function closeSheet(e){
  if(e && e.target!==$('sheet-mask')) return;
  $('sheet-mask').className='sheet-mask';
}
/* 图片上传（原型模拟：按分类给示意图） */
function mockUpload(){
  if(pubForm.images.length>=3){ toast('最多上传3张图片'); return; }
  const cat = pubForm.category || '其他';
  pubForm.images.push(EMOJI_MAP[cat]||'📦');
  renderUploads();
  toast('已添加示例图片（原型演示）',1400);
}
function removeUpload(i){ pubForm.images.splice(i,1); renderUploads(); }
function renderUploads(){
  const area=$('f-images');
  let html = pubForm.images.map((e,i)=>
    `<div class="upload-preview" style="background:${pubForm.type==='lost'?'#F8E9DF':'#E3EFE4'}">${e}
      <button class="up-del" onclick="removeUpload(${i})">×</button></div>`).join('');
  html += `<div class="upload-box" onclick="mockUpload()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-4.5-4.5L6 21"/></svg>
      <span>添加图片</span></div>`;
  area.innerHTML = html;
}
/* 提交 */
function guessEmoji(name, category){
  for(const k in NAME_EMOJI){ if(name.indexOf(k)>=0) return NAME_EMOJI[k]; }
  return EMOJI_MAP[category]||'📦';
}
function submitPublish(){
  if(!pubForm.type){ toast('请先选择「寻物启事」或「失物招领」'); return; }
  const name = $('f-name').value.trim();
  if(!name){ toast('请填写物品名称'); return; }
  if(!pubForm.category){ toast('请选择物品分类'); return; }
  if(!pubForm.place){ toast('请选择'+(pubForm.type==='lost'?'丢失':'捡到')+'地点'); return; }
  if(!pubForm.time){ toast('请选择'+(pubForm.type==='lost'?'丢失':'捡到')+'时间'); return; }
  const contact = $('f-contact').value.trim();
  if(!contact){ toast('请填写联系方式'); return; }
  const desc = $('f-desc').value.trim() || '发布者暂未填写更多描述。';
  const item = {
    id:nextId++, type:pubForm.type, name, category:pubForm.category,
    place:pubForm.place, time:pubForm.time, desc, contact,
    emoji:pubForm.images[0]||guessEmoji(name,pubForm.category),
    publisher:'我', dept:'经济与管理学院', pubTime:'刚刚',
    status:'active', mine:true
  };
  DATA.unshift(item);
  renderHome();
  $('sm-title').textContent = '发布成功';
  $('sm-desc').textContent = pubForm.type==='lost'
    ? '寻物启事已发布，同学们看到后会帮忙留意，有线索会尽快联系你。'
    : '招领信息已发布，失主看到后会尽快与你联系，请保持联系方式畅通。';
  $('success-modal').className='modal-mask show';
}
function closeSuccess(){ $('success-modal').className='modal-mask'; resetPublishForm(); }

/* ================= 搜索 ================= */
let searchHistory = ['校园卡','雨伞','钥匙','耳机'];
const HOT_WORDS = [
  {kw:'校园卡',count:'128人搜过'},
  {kw:'雨伞',count:'96人搜过'},
  {kw:'耳机',count:'74人搜过'},
  {kw:'钥匙',count:'63人搜过'},
  {kw:'保温杯',count:'41人搜过'},
  {kw:'眼镜',count:'35人搜过'},
];
function renderSearchGuide(){
  $('search-guide').style.display='block';
  $('search-result').style.display='none';
  $('search-input').value='';
  // 历史
  const hs=$('hist-tags');
  if(searchHistory.length){
    $('hist-section').style.display='block';
    hs.innerHTML = searchHistory.map(h=>
      `<span class="hist-tag" onclick="quickSearch('${h}')">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        ${h}</span>`).join('');
  } else { $('hist-section').style.display='none'; }
  // 热门
  $('hot-list').innerHTML = HOT_WORDS.map((h,i)=>
    `<div class="hot-item" onclick="quickSearch('${h.kw}')">
      <span class="hot-rank">${i+1}</span>
      <span class="hot-keyword">${h.kw}</span>
      <span class="hot-count">${h.count}</span>
    </div>`).join('');
}
function quickSearch(kw){
  $('search-input').value = kw;
  doSearch();
}
function doSearch(){
  const kw = $('search-input').value.trim();
  if(!kw){ toast('请输入要搜索的内容'); return; }
  // 记录历史
  searchHistory = [kw].concat(searchHistory.filter(h=>h!==kw)).slice(0,8);
  // 执行匹配
  const results = DATA.filter(d=>
    d.name.includes(kw)||d.category.includes(kw)||d.place.includes(kw)||d.desc.includes(kw)
  );
  $('result-head').innerHTML = '找到 <b id="result-count">0</b> 条与“<b id="result-kw"></b>”相关的信息';
  $('search-guide').style.display='none';
  $('search-result').style.display='block';
  $('result-count').textContent = results.length;
  $('result-kw').textContent = kw;
  const list=$('result-list');
  if(results.length){
    list.innerHTML = results.map(r=>{
      // 高亮关键词
      let c = cardHTML(r);
      c = c.replace(r.name, `<span class="kw-hl">${r.name}</span>`);
      return c;
    }).join('');
  } else {
    list.innerHTML = emptyHTML('没有找到与"'+kw+'"相关的信息\n换个关键词试试，或发布一条信息');
  }
}
function clearHistory(){
  searchHistory = [];
  renderSearchGuide();
  toast('搜索历史已清空',1300);
}

/* ================= 详情页 ================= */
let currentDetailId = null;
function renderDetail(id){
  const d = DATA.find(x=>x.id===id);
  if(!d){ toast('信息不存在'); backPage(); return; }
  const isLost = d.type==='lost';
  const done = d.status==='done';
  $('d-hero').className = 'detail-hero '+(isLost?'hero-lost':'hero-found');
  $('d-emoji').textContent = d.emoji;
  $('d-banner').className = 'detail-type-banner '+(isLost?'banner-lost':'banner-found');
  $('d-banner').innerHTML = (isLost
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg> 寻物启事'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 失物招领');
  $('d-status-banner').textContent = done?'已完成':'进行中';
  $('d-title').textContent = d.name;
  $('d-quick').innerHTML = `<span>${d.category}</span><span>${isLost?'丢失地点：':'捡到地点：'}${d.place}</span>`;
  $('d-type').textContent = isLost?'寻物启事（物品丢失，寻求线索）':'失物招领（捡到物品，寻找失主）';
  $('d-category').textContent = d.category;
  $('d-place-key').textContent = isLost?'丢失地点':'捡到地点';
  $('d-place').textContent = d.place;
  $('d-time-key').textContent = isLost?'丢失时间':'捡到时间';
  $('d-time').textContent = d.time;
  $('d-pubtime').textContent = d.pubTime==='刚刚'?'刚刚发布':d.pubTime;
  $('d-desc').textContent = d.desc;
  $('d-avatar').textContent = d.publisher.slice(0,1);
  $('d-pubname').textContent = d.mine?'我（'+d.dept+'）':d.publisher;
  $('d-pubdept').textContent = d.dept;
  // 底部操作区
  const ft = $('d-footer');
  if(d.mine && !done){
    ft.innerHTML = `<button class="status-btn" onclick="markDone(${d.id})">
      ${isLost?'我已找到物品，标记完成':'物品已归还失主，标记完成'}</button>`;
  } else if(d.mine && done){
    ft.innerHTML = `<button class="status-btn" style="background:#EFEEE8;color:var(--ink-3);" disabled>
      ${isLost?'物品已找到':'物品已归还'} · 已完成</button>`;
  } else {
    ft.innerHTML = `
      <button class="contact-btn call" onclick="toast('正在拨打对方电话…（原型演示）')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>
        电话联系</button>
      <button class="contact-btn chat" onclick="toast('已为你打开与对方的会话（原型演示）')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20l1-4.6A8.4 8.4 0 1 1 21 11.5Z"/></svg>
        站内联系</button>`;
  }
}
function markDone(id){
  const d = DATA.find(x=>x.id===id);
  d.status='done';
  toast(d.type==='lost'?'已标记为「找到」，恭喜！':'已标记为「已归还」，感谢你的善举！');
  renderDetail(id);
  renderHome();
  renderMine();
}

/* ================= 我的页面 ================= */
let mineFilter = 'all';
function renderMine(){
  const mine = DATA.filter(d=>d.mine);
  $('ms-all').textContent = mine.length;
  $('ms-lost').textContent = mine.filter(d=>d.type==='lost'&&d.status==='active').length;
  $('ms-found').textContent = mine.filter(d=>d.type==='found'&&d.status==='active').length;
  $('ms-done').textContent = mine.filter(d=>d.status==='done').length;
  let list;
  if(mineFilter==='active') list = mine.filter(d=>d.status==='active');
  else if(mineFilter==='done') list = mine.filter(d=>d.status==='done');
  else if(mineFilter==='lost') list = mine.filter(d=>d.type==='lost');
  else if(mineFilter==='found') list = mine.filter(d=>d.type==='found');
  else list = mine;
  const wrap=$('mine-list');
  wrap.innerHTML = list.length ? list.map(cardHTML).join('') : emptyHTML('这里还没有信息，点击下方「发布」试试');
}
function filterMine(f){
  mineFilter = f;
  document.querySelectorAll('#mine-filter button').forEach(b=>b.classList.toggle('on',b.dataset.mf===f));
  renderMine();
}

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

/* ================= 初始化 ================= */
renderHome();
