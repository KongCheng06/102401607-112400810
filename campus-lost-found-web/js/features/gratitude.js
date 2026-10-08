/* ================= 爱心积分 & 感谢信 ================= */
let userPoints = 60;
let thankLetters = [];
let currentThanksId = null;
let thanksMode = 'send';
function addPoints(n){
  userPoints += n;
  const el = $('mine-points');
  if(el) el.textContent = userPoints;
}
function thanksTpl(name){
  return '亲爱的同学：\n你好！我是「'+name+'」的失主。东西失而复得，我心里特别感激，谢谢你的热心与善意。愿这份温暖也能在你需要时回到你身边，我也会把它继续传递下去。\n再次感谢！\n—— 计算机与大数据学院 同学';
}
function openThanks(id){
  const d = DATA.find(x=>x.id===id);
  if(!d) return;
  currentThanksId = id;
  const ta = $('th-text');
  if(d.type==='lost'){
    thanksMode = 'send';
    $('th-title').textContent = '写一封感谢信';
    $('th-tip').textContent = '物品失而复得，向拾获同学表达感谢吧';
    ta.readOnly = false;
    ta.className = 'th-text';
    $('th-submit').textContent = '发送感谢信';
  }else{
    thanksMode = 'receive';
    $('th-title').textContent = '失主给你的感谢信';
    $('th-tip').textContent = '失主对你的善举表达了感谢';
    ta.readOnly = true;
    ta.className = 'th-text readonly';
    $('th-submit').textContent = '收下感谢';
  }
  ta.value = thanksTpl(d.name);
  $('thanks-modal').className = 'modal-mask show';
}
function closeThanks(){ $('thanks-modal').className = 'modal-mask'; }
function submitThanks(){
  const d = DATA.find(x=>x.id===currentThanksId);
  const text = $('th-text').value.trim();
  if(thanksMode==='send'){
    if(!text){ toast('感谢信还没有内容'); return; }
    thankLetters.unshift({id:Date.now(), item:d?d.name:'', text, time:'刚刚', dir:'sent'});
    if(d) d.thanked = true;
    closeThanks();
    toast('感谢信已发送，拾获同学将收到你的感谢');
  }else{
    thankLetters.unshift({id:Date.now(), item:d?d.name:'', text, time:'刚刚', dir:'received'});
    if(d) d.thanked = true;
    addPoints(10);
    closeThanks();
    toast('收到感谢信，爱心积分 +10');
  }
  renderDetail(currentThanksId);
  renderMine();
}
function markDone(id){
  const d = DATA.find(x=>x.id===id);
  d.status='done';
  if(d.type==='found'){
    addPoints(20);
    toast('物品已归还失主，感谢你的善举！爱心积分 +20');
  }else{
    toast('已标记为「找到」，恭喜！');
  }
  renderDetail(id);
  renderHome();
  renderMine();
}

