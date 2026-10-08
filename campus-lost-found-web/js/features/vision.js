/* ================= 拍照识物（OCR + 图像分析） ================= */
function pickPhotoRecognize(){ document.getElementById('f-ai-file').click(); }
function onPhotoRecognize(e){
  const f=(e.target.files||[])[0];
  e.target.value='';
  if(!f) return;
  const rd=new FileReader();
  rd.onload=function(){
    const dataUrl=rd.result;
    if(pubForm.images.length<3 && pubForm.images.indexOf(dataUrl)<0){
      pubForm.images.push(dataUrl); renderUploads();
    }
    runRecognize(f,dataUrl).then(function(infer){
      lastInfer=infer;
      showAiResult(infer);
      applyInfer(infer);
    });
  };
  rd.readAsDataURL(f);
}
function showScan(img,status,sub){
  document.getElementById('scan-img').src=img;
  document.getElementById('scan-status').textContent=status;
  document.getElementById('scan-sub').textContent=sub||'';
  document.getElementById('scan-mask').className='scan-mask show';
}
function setScanStatus(s){ document.getElementById('scan-status').textContent=s; }
function closeScan(){ document.getElementById('scan-mask').className='scan-mask'; }
let lastInfer=null;
async function runRecognize(file,dataUrl){
  showScan(dataUrl,'AI 正在识别…','OCR 文字识别 · 图像特征分析');
  let ocrText='';
  try{
    if(window.Tesseract){
      setScanStatus('正在加载 OCR 引擎…');
      const rec=await Promise.race([
        Tesseract.recognize(file,'eng',{
          logger:m=>{ if(m.status==='recognizing text') setScanStatus('正在识别文字…'); }
        }),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('ocr-timeout')),15000))
      ]);
      ocrText=(rec&&rec.data&&rec.data.text)?rec.data.text.trim():'';
    }
  }catch(err){ ocrText=''; }
  setScanStatus('正在分析图像特征…');
  let feat={};
  try{ feat=await analyzeImage(dataUrl); }catch(e){ feat={}; }
  const infer=inferCategory(ocrText,feat);
  infer.ocr=ocrText; infer.feat=feat; infer.imageSrc=dataUrl;
  await new Promise(r=>setTimeout(r,750));
  closeScan();
  return infer;
}
function analyzeImage(dataUrl){
  return new Promise(function(resolve){
    const img=new Image();
    img.onload=function(){
      const size=120;
      const cv=document.createElement('canvas');
      cv.width=size;cv.height=size;
      const ctx=cv.getContext('2d');
      ctx.drawImage(img,0,0,size,size);
      let data;
      try{ data=ctx.getImageData(0,0,size,size).data; }catch(e){ resolve({}); return; }
      let r=0,g=0,b=0,n=0,gray=0,bright=0;
      for(let i=0;i<data.length;i+=4){
        const R=data[i],G=data[i+1],B=data[i+2];
        r+=R;g+=G;b+=B;n++;
        if(Math.max(R,G,B)-Math.min(R,G,B)<24) gray++;
        bright+=(R+G+B)/3;
      }
      r=Math.round(r/n);g=Math.round(g/n);b=Math.round(b/n);
      resolve({
        r,g,b,
        hex:'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join(''),
        grayRatio:Math.round(gray/n*100),
        bright:Math.round(bright/n),
        ratio:Math.round(img.width/img.height*100)/100
      });
    };
    img.onerror=()=>resolve({});
    img.src=dataUrl;
  });
}

/* 浏览器端图像向量：优先 MobileNet，失败时退回到颜色/结构指纹 */
let visionModelPromise=null;
const imageVectorCache=new Map();
function normalizeVector(values){
  let norm=0;
  for(const v of values) norm+=v*v;
  norm=Math.sqrt(norm)||1;
  return values.map(v=>v/norm);
}
function loadVisionModel(){
  if(!window.tf||!window.mobilenet) return Promise.reject(new Error('vision-model-unavailable'));
  if(!visionModelPromise){
    visionModelPromise=Promise.race([
      mobilenet.load({version:2,alpha:0.5}),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('vision-model-timeout')),15000))
    ]).catch(err=>{
      visionModelPromise=null;
      throw err;
    });
  }
  return visionModelPromise;
}
function loadImageElement(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('image-load-failed'));
    img.src=src;
  });
}
function fallbackImageVector(img){
  const size=64;
  const cv=document.createElement('canvas');
  cv.width=size; cv.height=size;
  const ctx=cv.getContext('2d');
  ctx.drawImage(img,0,0,size,size);
  const pixels=ctx.getImageData(0,0,size,size).data;
  const colorHist=new Array(64).fill(0);
  const grayHist=new Array(16).fill(0);
  const grid=new Array(16).fill(0);
  for(let y=0;y<size;y++){
    for(let x=0;x<size;x++){
      const i=(y*size+x)*4;
      const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      colorHist[(r>>6)*16+(g>>6)*4+(b>>6)]++;
      const lum=(r+g+b)/3;
      grayHist[Math.min(15,Math.floor(lum/16))]++;
      grid[Math.floor(y/16)*4+Math.floor(x/16)]+=lum/255;
    }
  }
  const count=size*size;
  return normalizeVector(
    colorHist.map(v=>v/count)
      .concat(grayHist.map(v=>v/count))
      .concat(grid.map(v=>v/256))
      .concat([Math.min(3,img.width/img.height)/3])
  );
}
async function getImageVector(src){
  if(!src) return null;
  if(imageVectorCache.has(src)) return imageVectorCache.get(src);
  const task=(async()=>{
    const img=await loadImageElement(src);
    try{
      const model=await loadVisionModel();
      const tensor=model.infer(img,true);
      const values=Array.from(await tensor.data());
      tensor.dispose();
      return normalizeVector(values);
    }catch(err){
      return fallbackImageVector(img);
    }
  })();
  imageVectorCache.set(src,task);
  try{
    const vector=await task;
    imageVectorCache.set(src,vector);
    return vector;
  }catch(err){
    imageVectorCache.delete(src);
    return null;
  }
}
function cosineSimilarity(a,b){
  if(!a||!b||a.length!==b.length) return null;
  let dot=0,normA=0,normB=0;
  for(let i=0;i<a.length;i++){
    dot+=a[i]*b[i]; normA+=a[i]*a[i]; normB+=b[i]*b[i];
  }
  if(!normA||!normB) return null;
  return Math.max(0,Math.min(1,dot/(Math.sqrt(normA)*Math.sqrt(normB))));
}
async function imageSimilarity(a,b){
  const srcA=a.matchImg||a.img;
  const srcB=b.matchImg||b.img;
  if(!srcA||!srcB) return null;
  const vectors=await Promise.all([getImageVector(srcA),getImageVector(srcB)]);
  return cosineSimilarity(vectors[0],vectors[1]);
}
function inferCategory(ocrText,feat){
  const t=(ocrText||'').toLowerCase();
  const rules=[
    {cat:'校园卡证件',conf:92,kw:['card','id','no.','no:','student','学号','校园卡','卡号','bank','银行'],name:'校园卡'},
    {cat:'书籍文具',conf:88,kw:['isbn','书','出版','教材','大学','教程','edition','press','manual','高等','数学','英语'],name:'书籍'},
    {cat:'数码电子',conf:85,kw:['airpods','耳机','phone','手机','usb','充电','蓝牙','power','digital','earbuds'],name:'耳机'},
    {cat:'钥匙',conf:80,kw:['key','钥匙'],name:'钥匙'},
    {cat:'水杯雨伞',conf:78,kw:['umbrella','伞','杯','water','bottle','thermos'],name:'雨伞'},
    {cat:'衣物配饰',conf:72,kw:['衣','外套','包','hat','jacket','scarf'],name:'衣物'}
  ];
  let best=null;
  for(const r of rules){
    let hits=0;
    for(const k of r.kw){ if(t.indexOf(k.toLowerCase())>=0) hits++; }
    if(hits>0){
      const conf=Math.min(97,r.conf+hits*2);
      if(!best||conf>best.conf) best={cat:r.cat,conf:conf,hits:hits,name:r.name};
    }
  }
  if(best) return {cat:best.cat,conf:best.conf,suggestName:best.name,reason:'OCR 识别到 '+best.hits+' 个相关文字'};
  if(feat && typeof feat.grayRatio==='number' && feat.grayRatio>70){
    return {cat:'数码电子',conf:45,suggestName:'',reason:'图像偏黑白灰，疑似数码/卡片，建议人工确认'};
  }
  return {cat:'其他',conf:35,suggestName:'',reason:'未识别到明显文字或特征，建议手动选择'};
}
function showAiResult(infer){
  const el=document.getElementById('ai-result');
  const ocrShow=infer.ocr?escapeHtml(infer.ocr).slice(0,120):'（未识别到清晰文字，可能是无文字物品）';
  const f=infer.feat||{};
  const feats=[];
  if(f.hex) feats.push('主色调 '+f.hex);
  if(typeof f.grayRatio==='number') feats.push('灰白占比 '+f.grayRatio+'%');
  if(typeof f.bright==='number') feats.push('亮度 '+f.bright);
  if(f.ratio) feats.push('比例 '+f.ratio);
  el.innerHTML=
    '<div class="ai-result-head"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 4.6L19 9l-4.6 1.9L12 15l-2.4-4.1L5 9l5.1-1.4L12 3Z"/><path d="M19 14v4M17 16h4"/></svg>AI 识别结果</div>'+
    '<div class="ai-result-body"><div class="ai-cat-row"><span class="ai-cat">'+infer.cat+'</span><span class="ai-conf">置信度 '+infer.conf+'%</span></div>'+
    '<div class="ai-ocr"><span class="lab">OCR 识别文字</span>'+ocrShow+'</div>'+
    (feats.length?'<div class="ai-feats">'+feats.map(x=>'<span class="ai-feat">'+x+'</span>').join('')+'</div>':'')+
    '<div class="ai-ocr" style="margin-top:9px"><span class="lab">判断依据</span>'+escapeHtml(infer.reason)+'</div></div>'+
    '<div class="ai-result-foot"><button class="ai-apply" onclick="applyInfer(lastInfer,true)">应用结果</button>'+
    '<button class="ai-retry" onclick="document.getElementById(\'ai-result\').style.display=\'none\'">手动选择</button></div>';
  el.style.display='block';
}
function applyInfer(infer,manual){
  if(!infer) return;
  document.querySelectorAll('#f-category .chip').forEach(c=>{
    if(c.textContent===infer.cat) selectCategory(c);
  });
  if(infer.suggestName && !document.getElementById('f-name').value.trim()){
    document.getElementById('f-name').value=infer.suggestName;
  }
  if(manual) toast('已应用 AI 识别结果');
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
