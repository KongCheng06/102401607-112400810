/* ================= 拍照搜物（以图搜物） ================= */
function quickPhotoSearch(){
  renderSearchGuide();
  navigate('page-search','slide');
  setTimeout(function(){ pickSearchPhoto(); },400);
}
function pickSearchPhoto(){ $('s-ai-file').click(); }
function onSearchPhoto(e){
  const f=(e.target.files||[])[0];
  e.target.value='';
  if(!f) return;
  const rd=new FileReader();
  rd.onload=function(){
    const dataUrl=rd.result;
    runRecognize(f,dataUrl).then(infer=>searchByInfer(infer,dataUrl));
  };
  rd.readAsDataURL(f);
}
const CATEGORY_WORDS={
  '校园卡证件':['校园卡','学生证','学生卡'],
  '书籍文具':['书','教材','书本'],
  '数码电子':['耳机','手机','充电'],
  '钥匙':['钥匙'],
  '水杯雨伞':['杯','伞'],
  '衣物配饰':['眼镜','衣','包','外套'],
  '其他':[]
};
async function searchByInfer(infer,queryImage){
  showScan(queryImage,'正在比对图片…','本地提取视觉向量 · 相似度排序');
  let words=[];
  if(infer.suggestName) words.push(infer.suggestName);
  if(infer.ocr) extractKeywords(infer.ocr).forEach(k=>words.push(k));
  (CATEGORY_WORDS[infer.cat]||[]).forEach(w=>words.push(w));
  words=[...new Set(words)];
  const queryVector=await getImageVector(queryImage);
  const ranked=await Promise.all(DATA.map(async d=>{
    const hay=d.name+' '+d.category+' '+d.place+' '+d.desc;
    const textHit=words.some(w=>hay.indexOf(w)>=0);
    const itemImage=d.matchImg||d.img;
    const itemVector=itemImage?await getImageVector(itemImage):null;
    const visual=cosineSimilarity(queryVector,itemVector);
    if(!textHit&&(visual===null||visual<0.6)) return null;
    return {item:d,visual,score:(visual===null?0:visual*70)+(textHit?30:0),textHit};
  }));
  const results=ranked.filter(Boolean).sort((a,b)=>b.score-a.score);
  closeScan();
  const kw=words[0]||infer.cat;
  searchHistory=[kw].concat(searchHistory.filter(h=>h!==kw)).slice(0,8);
  $('search-input').value=kw;
  $('search-guide').style.display='none';
  $('search-result').style.display='block';
  $('result-head').innerHTML='拍照识别为「<b>'+infer.cat+'</b>」，结合图片相似度找到 <b>'+results.length+'</b> 条可能信息';
  const list=$('result-list');
  if(results.length){
    list.innerHTML=results.map(result=>{
      const r=result.item;
      let c=cardHTML(r);
      if(result.textHit&&words.some(w=>r.name.indexOf(w)>=0)) c=c.replace(r.name,'<span class="kw-hl">'+r.name+'</span>');
      if(result.visual!==null){
        c=c.replace('<div class="info-name">','<div class="photo-sim">图片相似 '+Math.round(result.visual*100)+'%</div><div class="info-name">');
      }
      return c;
    }).join('');
  }else{
    list.innerHTML=emptyHTML('没有找到与该物品相关的信息\n你可以发布一条信息，让失物或失主看到');
  }
}


