/* ================= 发布流程 ================= */
let pubForm = {type:null, category:null, place:null, time:null, images:[], reward:0};

function resetPublishForm(){
  pubForm = {type:null, category:null, place:null, time:null, images:[], reward:0};
  lastInfer=null;
  $('f-reward-row').style.display='none';
  document.querySelectorAll('#f-reward .reward-chip').forEach(c=>c.classList.toggle('on',c.dataset.r==='0'));
  $('pt-lost').className = 'pub-type-card';
  $('pt-found').className = 'pub-type-card';
  $('f-name').value=''; $('f-desc').value=''; $('f-contact').value='';
  document.querySelectorAll('#f-category .chip').forEach(c=>c.className='chip');
  setPlaceValue(null); setTimeValue(null);
  renderUploads();
  $('ai-result').style.display='none';
}
function selectPubType(type){
  pubForm.type = type;
  $('pt-lost').className = 'pub-type-card'+(type==='lost'?' selected-lost':'');
  $('pt-found').className = 'pub-type-card'+(type==='found'?' selected-found':'');
  $('f-reward-row').style.display = type==='lost'?'flex':'none';
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
function selectReward(el){
  document.querySelectorAll('#f-reward .reward-chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  pubForm.reward=parseInt(el.dataset.r,10)||0;
}
/* 地点/时间选择弹层 */
const PLACES = ['图书馆','东一教学楼','东二教学楼','东三教学楼','西一教学楼','西二教学楼','西三教学楼','中楼',
 '京元餐厅','丁香园','紫荆园','玫瑰园','教工餐厅','一区学生街',
 '第一田径场','第二田径场','风雨操场','游泳馆','宏晖文体馆','篮球场/网球场',
 '素拓中心','校医院','快递中心','1区宿舍','2区宿舍','3区宿舍','4区宿舍','5区宿舍','山北行政楼','其他地点'];
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
/* 本地图片选择与读取 */
function pickLocalImage(){
  if(pubForm.images.length>=3){ toast('最多上传3张图片'); return; }
  $('f-file').click();
}
function onPickLocal(e){
  const files=Array.from(e.target.files||[]);
  if(!files.length) return;
  const remain=3-pubForm.images.length;
  files.slice(0,remain).forEach(function(f){
    if(!f.type.startsWith('image/')) return;
    const rd=new FileReader();
    rd.onload=function(){
      pubForm.images.push(rd.result);
      renderUploads();
    };
    rd.readAsDataURL(f);
  });
  e.target.value='';
}
function removeUpload(i){ pubForm.images.splice(i,1); renderUploads(); }
function renderUploads(){
  const area=$('f-images');
  let html = pubForm.images.map((src,i)=>
    `<div class="upload-preview">
      <img src="${src}" alt="物品图片">
      <button class="up-del" onclick="removeUpload(${i})">×</button></div>`).join('');
  html += `<div class="upload-box" onclick="pickLocalImage()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A6A094" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-4.5-4.5L6 21"/></svg>
      <span>添加图片</span></div>`;
  area.innerHTML = html;
}

