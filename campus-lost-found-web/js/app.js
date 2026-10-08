/* ================= 初始化 ================= */
renderHome();

/* ================= 状态栏时钟（显示真实当前时间） ================= */
function tickClock(){
  const d=new Date();
  const hh=d.getHours();
  const mm=String(d.getMinutes()).padStart(2,'0');
  const el=document.getElementById('clock');
  if(el) el.textContent=hh+':'+mm;
}
tickClock();
setInterval(tickClock,20000);

/* ================= 实时天气（Open-Meteo，免费无密钥，固定福大旗山校区） ================= */
function wmoText(c){
  if(c===0) return '晴';
  if(c===1) return '晴间多云';
  if(c===2) return '多云';
  if(c===3) return '阴';
  if(c===45||c===48) return '雾';
  if(c>=51&&c<=57) return '毛毛雨';
  if(c>=61&&c<=67) return '雨';
  if(c>=71&&c<=77) return '雪';
  if(c>=80&&c<=82) return '阵雨';
  if(c===85||c===86) return '阵雪';
  if(c>=95) return '雷阵雨';
  return '晴';
}
function loadWeather(){
  const url='https://api.open-meteo.com/v1/forecast?latitude=26.062&longitude=119.195&current=temperature_2m,weather_code&timezone=Asia/Shanghai';
  fetch(url).then(r=>r.json()).then(d=>{
    const cur=d.current;
    const txt=wmoText(cur.weather_code)+' '+Math.round(cur.temperature_2m)+'°';
    const el=document.getElementById('weather');
    if(el) el.textContent=txt;
  }).catch(()=>{ /* 离线时保留默认文字 */ });
}
loadWeather();
setInterval(loadWeather,10*60*1000);

/* ================= 电池电量（与设备同步，Battery API） ================= */
function renderBattery(b){
  const el=document.getElementById('battery-fill');
  if(!el) return;
  const lv=b.level;
  const w=lv>0?Math.max(3,16*lv):0;   /* 满格宽16，低电量保留最小圆角 */
  el.setAttribute('width',w.toFixed(1));
  el.setAttribute('fill', b.charging ? '#5E9E74' : 'currentColor');
}
if(navigator.getBattery){
  navigator.getBattery().then(b=>{
    renderBattery(b);
    b.addEventListener('levelchange',()=>renderBattery(b));
    b.addEventListener('chargingchange',()=>renderBattery(b));
  });
}

/* ================= 网络状态（在线/离线同步；信号格数浏览器无权限获取） ================= */
function renderNet(){
  var online=navigator.onLine;
  ['signal-icon','wifi-icon'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.opacity=online?'1':'.25';
  });
}
renderNet();
window.addEventListener('online',renderNet);
window.addEventListener('offline',renderNet);
// 站内聊天：回车发送
document.getElementById('chat-input').addEventListener('keydown',function(e){
  if(e.key==='Enter'){ e.preventDefault(); sendChat(); }
});
