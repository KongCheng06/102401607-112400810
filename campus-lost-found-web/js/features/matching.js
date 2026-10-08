/* 提交 */
function guessEmoji(name, category){
  for(const k in NAME_EMOJI){ if(name.indexOf(k)>=0) return NAME_EMOJI[k]; }
  return EMOJI_MAP[category]||'📦';
}
/* ================= 智能匹配 ================= */
const SYNONYMS=[
  {std:'伞',keys:['伞','雨伞','折叠伞','遮阳伞','umbrella']},
  {std:'校园卡',keys:['校园卡','学生证','学生卡','饭卡','card','id卡']},
  {std:'耳机',keys:['耳机','airpods','蓝牙耳机','earbuds','earpods']},
  {std:'水杯',keys:['水杯','杯子','保温杯','茶杯','水壶','bottle','cup','thermos']},
  {std:'钥匙',keys:['钥匙','key']},
  {std:'书',keys:['书','教材','书籍','书本','课本','book']},
  {std:'手机',keys:['手机','phone','iphone']},
  {std:'充电器',keys:['充电器','充电线','数据线','usb','充电头']},
  {std:'眼镜',keys:['眼镜','墨镜','glasses']},
  {std:'包',keys:['书包','背包','包','bag']},
  {std:'衣物',keys:['外套','衣服','卫衣','夹克','上衣','jacket']}
];
function extractKeywords(name){
  const n=(name||'').toLowerCase();
  const stds=[];
  for(const s of SYNONYMS){
    for(const k of s.keys){
      if(n.indexOf(k.toLowerCase())>=0){ stds.push(s.std); break; }
    }
  }
  return stds;
}
const AREA_GROUPS=[
  ['京元餐厅','丁香园','紫荆园','玫瑰园','教工餐厅'],
  ['第一田径场','第二田径场','风雨操场','篮球场/网球场'],
  ['东一教学楼','东二教学楼','东三教学楼','中楼','西一教学楼','西二教学楼','西三教学楼'],
  ['1区宿舍','2区宿舍','3区宿舍','4区宿舍','5区宿舍']
];
const MATCH_WEIGHTS={image:50,category:20,place:15,time:10,keyword:5};
function sameArea(p,q){
  for(const g of AREA_GROUPS){
    if(g.indexOf(p)>=0 && g.indexOf(q)>=0) return true;
  }
  return false;
}
function placeMatch(p,q){
  if(p===q) return 'same';
  if(p&&q&&(p.indexOf(q)>=0||q.indexOf(p)>=0)) return 'same';
  if(sameArea(p,q)) return 'area';
  return null;
}
function timeKey(t){
  t=String(t);
  if(t.indexOf('今天')>=0) return '今天';
  if(t.indexOf('昨天')>=0) return '昨天';
  if(t.indexOf('3天')>=0) return '3天';
  if(t.indexOf('本周')>=0) return '本周';
  return '';
}
async function calcMatch(a,b){
  if(a.type===b.type) return null;
  let weightedScore=0;
  let availableWeight=0;
  const reasonParts=[];

  const visual=await imageSimilarity(a,b);
  if(visual!==null){
    availableWeight+=MATCH_WEIGHTS.image;
    weightedScore+=visual*MATCH_WEIGHTS.image;
    reasonParts.push({points:visual*MATCH_WEIGHTS.image,text:'图片相似度 '+Math.round(visual*100)+'%'});
  }

  availableWeight+=MATCH_WEIGHTS.category;
  if(a.category===b.category){
    weightedScore+=MATCH_WEIGHTS.category;
    reasonParts.push({points:MATCH_WEIGHTS.category,text:'物品类别相同'});
  }

  const textA=[a.name,a.desc,a.ocr].filter(Boolean).join(' ');
  const textB=[b.name,b.desc,b.ocr].filter(Boolean).join(' ');
  const ka=extractKeywords(textA), kb=extractKeywords(textB);
  const common=ka.filter(k=>kb.indexOf(k)>=0);
  availableWeight+=MATCH_WEIGHTS.keyword;
  if(common.length){
    weightedScore+=MATCH_WEIGHTS.keyword;
    reasonParts.push({points:MATCH_WEIGHTS.keyword,text:'OCR/名称关键词相符（'+common.join('、')+'）'});
  }

  const pm=placeMatch(a.place,b.place);
  if(a.place&&b.place) availableWeight+=MATCH_WEIGHTS.place;
  if(pm==='same'){
    weightedScore+=MATCH_WEIGHTS.place;
    reasonParts.push({points:MATCH_WEIGHTS.place,text:'地点相同（'+(a.place.length<=b.place.length?a.place:b.place)+'）'});
  }else if(pm==='area'){
    const areaPoints=MATCH_WEIGHTS.place*2/3;
    weightedScore+=areaPoints;
    reasonParts.push({points:areaPoints,text:'地点在同一区域'});
  }

  const ta=timeKey(a.time),tb=timeKey(b.time);
  if(a.time&&b.time) availableWeight+=MATCH_WEIGHTS.time;
  if(ta&&ta===tb){
    weightedScore+=MATCH_WEIGHTS.time;
    reasonParts.push({points:MATCH_WEIGHTS.time,text:'时间相近'});
  }

  const score=Math.min(99,Math.round(weightedScore/(availableWeight||1)*100));
  const reasons=reasonParts.sort((x,y)=>y.points-x.points).map(x=>x.text);
  return {score,reasons};
}
async function findMatches(item){
  const candidates=DATA.filter(o=>o.id!==item.id&&o.status!=='done');
  const calculated=await Promise.all(candidates.map(async o=>({item:o,match:await calcMatch(item,o)})));
  const out=[];
  calculated.forEach(({item:o,match:m})=>{
    if(m&&m.score>=60) out.push({id:o.id,score:m.score,reasons:m.reasons});
  });
  out.sort((a,b)=>b.score-a.score);
  return out;
}
async function submitPublish(){
  if(!pubForm.type){ toast('请先选择「寻物启事」或「失物招领」'); return; }
  const name = $('f-name').value.trim();
  if(!name){ toast('请填写物品名称'); return; }
  if(!pubForm.category){ toast('请选择物品分类'); return; }
  if(!pubForm.place){ toast('请选择'+(pubForm.type==='lost'?'丢失':'捡到')+'地点'); return; }
  if(!pubForm.time){ toast('请选择'+(pubForm.type==='lost'?'丢失':'捡到')+'时间'); return; }
  const contact = $('f-contact').value.trim();
  if(!contact){ toast('请填写联系方式'); return; }
  const desc = $('f-desc').value.trim() || '发布者暂未填写更多描述。';
  const submitBtn=document.querySelector('#page-publish .btn-primary');
  submitBtn.disabled=true;
  submitBtn.textContent='正在分析并匹配…';
  const recognizedImage=lastInfer&&pubForm.images.indexOf(lastInfer.imageSrc)>=0?lastInfer.imageSrc:null;
  const item = {
    id:nextId++, type:pubForm.type, name, category:pubForm.category,
    place:pubForm.place, time:pubForm.time, desc, contact,
    emoji:guessEmoji(name,pubForm.category),
    img:pubForm.images[0]||null,
    matchImg:recognizedImage||pubForm.images[0]||null,
    ocr:recognizedImage?(lastInfer.ocr||''):'',
    reward:pubForm.type==='lost'?(pubForm.reward||0):0,
    publisher:'我', dept:'计算机与大数据学院', pubTime:'刚刚',
    status:'active', mine:true, matches:[]
  };
  DATA.unshift(item);
  if(item.type==='found') addPoints(10);
  const matches=await findMatches(item);
  if(matches.length){
    item.matches=matches;
    matches.forEach(m=>{
      const other=DATA.find(x=>x.id===m.id);
      if(other){
        if(!other.matches) other.matches=[];
        other.matches.push({id:item.id,score:m.score,reasons:m.reasons});
      }
      MESSAGES.unshift({
        bg:'#EEF1E8', color:'#6B7A4A',
        svg:'<path d="m12 3 1.9 4.6L19 9l-4.6 1.9L12 15l-2.4-4.1L5 9l5.1-1.4L12 3Z"/><path d="M19 14v4M17 16h4"/>',
        t:'智能匹配：你的「'+name+'」可能找到了',
        d:'匹配度 '+m.score+'%，'+m.reasons[0]+'，点击查看',
        time:'刚刚', itemId:item.id
      });
    });
  }
  renderHome();
  if(matches.length){
    $('sm-title').textContent='发布成功 · 发现 '+matches.length+' 条匹配';
    $('sm-desc').textContent='系统在现有信息中为你找到可能匹配的物品，最高匹配度 '+matches[0].score+'%，建议尽快查看确认。';
    $('sm-btns').innerHTML=
      '<button class="sm-btn dark" onclick="closeSuccess();goDetail('+item.id+')">查看匹配</button>'+
      '<button class="sm-btn light" onclick="closeSuccess();switchTab(\'home\')">返回首页</button>';
  }else{
    $('sm-title').textContent='发布成功';
    $('sm-desc').textContent=pubForm.type==='lost'
      ? '寻物启事已发布，同学们看到后会帮忙留意，有线索会尽快联系你。'
      : '招领信息已发布，失主看到后会尽快与你联系。爱心积分 +10，感谢你的善意！';
    $('sm-btns').innerHTML=
      '<button class="sm-btn light" onclick="closeSuccess();switchTab(\'mine\')">查看我的发布</button>'+
      '<button class="sm-btn dark" onclick="closeSuccess();switchTab(\'home\')">返回首页</button>';
  }
  submitBtn.disabled=false;
  submitBtn.textContent='立即发布';
  $('success-modal').className='modal-mask show';
}
function closeSuccess(){ $('success-modal').className='modal-mask'; resetPublishForm(); }

