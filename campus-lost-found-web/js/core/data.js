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
   contact:'手机：138****6620',emoji:'🪪',publisher:'王同学',dept:'计算机与大数据学院',pubTime:'1小时前',status:'active',mine:true},
  {id:3,type:'lost',name:'AirPods Pro 2 耳机',category:'数码电子',place:'第一田径场看台',time:'9月25日 傍晚',
   desc:'傍晚在第一田径场跑步后丢失，白色充电盒，盒身有轻微划痕，里面有左耳和右耳，对我很重要，必有重谢！',
   contact:'微信：run_run_233',emoji:'🎧',publisher:'赵同学',dept:'体育教学部',pubTime:'2小时前',status:'active',mine:false,reward:50},
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
  {id:8,type:'found',name:'浅蓝色自动雨伞',category:'水杯雨伞',place:'快递中心门口',time:'9月24日 下午',
   desc:'下雨天在快递中心门口捡到一把浅蓝色长柄自动伞，已交到快递中心服务台，失主可凭特征描述认领。',
   contact:'微信：umbrella_keep',emoji:'☂️',publisher:'吴同学',dept:'计算机与大数据学院',pubTime:'3天前',status:'done',mine:true},
  {id:9,type:'lost',name:'粉色自行车钥匙',category:'钥匙',place:'3区学生宿舍停车棚',time:'9月24日 中午',
   desc:'自行车钥匙上有粉色兔子挂件，在3区停车棚附近遗失，车子还锁在那里，急！',
   contact:'手机：186****0945',emoji:'🔑',publisher:'郑同学',dept:'计算机与大数据学院',pubTime:'3天前',status:'active',mine:false},
];
let nextId = 10;

