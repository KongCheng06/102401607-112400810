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
  const wall=$('thx-wall');
  $('thx-count').textContent = thankLetters.length+' 封';
  if(thankLetters.length){
    wall.innerHTML = thankLetters.map(l=>
      '<div class="thx-letter'+(l.dir==='received'?' rcv':'')+'"><div class="tl-item"><span class="tl-dir">'+(l.dir==='received'?'我收到的':'我发出的')+'</span>「'+l.item+'」 · '+l.time+'</div><div class="tl-text">'+l.text.replace(/\n/g,'<br>')+'</div></div>'
    ).join('');
  }else{
    wall.innerHTML = '<div class="thx-empty">完成一次归还后，在这里写下你的感谢信</div>';
  }
}
function filterMine(f){
  mineFilter = f;
  document.querySelectorAll('#mine-filter button').forEach(b=>b.classList.toggle('on',b.dataset.mf===f));
  renderMine();
}

