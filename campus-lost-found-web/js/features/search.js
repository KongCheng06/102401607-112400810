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
