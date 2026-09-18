// scene1-ask.jsx — v2 场景1：用户输入可提取结构化记录 + 健康咨询
//
// 1. 按住说话松开 → 「今天月经开始了，我的经期规律么？」落轴
// 2. 加载态 2s：「记录提取中...」「AI分析中...」轮播
// 3. 展示提取出的标签「月经来了」+ 对话入口「经期规律分析」
// 4. 点对话入口 → 二级页对话流：该句作为首条用户输入，AI 直接流式输出分析
// 5. 二级页按住说话松开 → 追加用户输入「今天流量中等，轻微痛经」→ 提取加载态 2s → AI 流式回复
//    加载态结束时，时间轴今天追加一张原生经期记录卡：月经来了 / 流量：中等 / 痛经：轻微
// 6. 返回点滴页再进入对话页：已输出的内容直接展示，不重复流式输出
//
// 场景2 复用同一套卡片与对话页：按住说话松开 → 「我的月经规律么？」落轴 → 加载态 2s → 只展示对话入口（无标签）

// 方案1：时间轴里只说记录本身，问句交给反馈下方的追问栏
const SCENE1_QUESTION = '今天月经开始了';
const SCENE1_CHAT_TITLE = '经期规律分析';
const SCENE1_EXTRACT_MS = 2000;
const SCENE1_LOADING_COPY = ['记录提取中...', 'AI分析中...'];
const SCENE1_LOADING_ROTATE_MS = 1000;

// 流式输出速度：每 36ms 吐 1–3 个字，接近真实大模型输出节奏
const SCENE1_STREAM_TICK_MS = 36;

const SCENE1_ANSWER = [
  { type:'p', text:'已帮你记下「月经来了」。结合你最近 6 个周期的记录，一起来看看规律性：' },
  { type:'h', text:'你的周期情况' },
  { type:'li', text:'平均周期 29 天，最近 6 次在 27–31 天之间' },
  { type:'li', text:'经期平均持续 5 天，前后比较一致' },
  { type:'li', text:'这次比预测提前 1 天，属于正常波动' },
  { type:'h', text:'结论：你的经期是规律的' },
  { type:'p', text:'一般来说，周期在 21–35 天之间、相邻两次相差不超过 7 天，都算规律。你最近的波动只有 4 天，整体状态不错。' },
  { type:'h', text:'这几天可以这样照顾自己' },
  { type:'li', text:'注意腹部保暖、少吃生冷，痛经时可以热敷小腹' },
  { type:'li', text:'顺手记下流量和痛经程度，下次分析会更准' },
  { type:'li', text:'如果周期连续短于 21 天或长于 35 天，或经期超过 7 天，建议及时就医' },
];

// 场景2：纯提问，没有可提取的记录；对话页首条分析去掉「已帮你记下」，
// 并在结尾追问今天的流量与痛经，引导用户继续说（接着按住说话发出的正是这两项）
const SCENE2_QUESTION = '我的月经规律么？';
const SCENE2_ANSWER = [
  { type:'p', text:'结合你最近 6 个周期的记录，一起来看看你的月经规律性：' },
  { type:'h', text:'你的周期情况' },
  { type:'li', text:'平均周期 29 天，最近 6 次在 27–31 天之间' },
  { type:'li', text:'经期平均持续 5 天，前后比较一致' },
  { type:'li', text:'最近一次周期比预测提前 1 天，属于正常波动' },
  { type:'h', text:'结论：你的经期是规律的' },
  { type:'p', text:'一般来说，周期在 21–35 天之间、相邻两次相差不超过 7 天，都算规律。你最近的波动只有 4 天，整体状态不错。' },
  { type:'h', text:'这几天可以这样照顾自己' },
  { type:'li', text:'注意腹部保暖、少吃生冷，痛经时可以热敷小腹' },
  { type:'li', text:'顺手记下流量和痛经程度，下次分析会更准' },
  { type:'li', text:'如果周期连续短于 21 天或长于 35 天，或经期超过 7 天，建议及时就医' },
  { type:'p', text:'对了，今天的流量和痛经情况怎么样？说给我听，我帮你记下来。' },
];

// 二级页追问：按住说话松开后的固定语音内容；AI 先展示与时间轴一致的提取加载态，再流式回复
const SCENE1_FOLLOWUP_TEXT = '今天流量中等，轻微痛经';
const SCENE1_FOLLOWUP_ANSWER = [
  { type:'p', text:'已经帮你记录下今天的流量和痛经情况，可以在点滴时间轴查看记录内容。' },
];

// options.completed：直接生成播放完成态（无加载态、无入场动画，对话页展示完整历史），供场景3初始态使用
// 场景2 追问回复：对号确认已记录 → 记录卡片 → 针对流量/痛经的分析 → 结尾再抛一个问题引导继续说
// 记录卡片带当前日期时间，所以用函数在发送时生成
const SCENE2_RECORD_ROWS = [
  { label:'流量', value:'中等', icon:'assets/record-flow.png' },
  { label:'痛经', value:'轻微', icon:'assets/record-cramps.png' },
];

function formatScene2RecordTime(d = new Date()){
  const pad = n=>String(n).padStart(2, '0');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildScene2FollowupAnswer(){
  return [
    { type:'done', text:'已记录' },
    { type:'record', text:'', record:{ time:formatScene2RecordTime(), rows:SCENE2_RECORD_ROWS } },
    { type:'h', text:'今天这两项的情况' },
    { type:'li', text:'流量中等，处于经期前两天的常见范围' },
    { type:'li', text:'轻微痛经多与前列腺素引起的子宫收缩有关，通常 1–2 天会缓解' },
    { type:'p', text:'和上个周期的同一天相比，流量和痛感都差不多，没有明显变化。' },
    { type:'h', text:'可以试试' },
    { type:'li', text:'热敷小腹 15–20 分钟，避免久坐和生冷' },
    { type:'li', text:'疼痛影响睡眠或工作时，可在医生或药师指导下使用止痛药' },
    { type:'p', text:'对了，今天有没有觉得腰酸、犯困或者情绪低落？一并说给我，我帮你记下来。' },
  ];
}

// 场景2 第二轮追问：心情、疲惫、腰酸
const SCENE2_ROUND2_TEXT = '今天心情一般，有点腰酸，而且感觉特别疲惫。';
const SCENE2_ROUND2_ROWS = [
  { label:'心情', value:'一般', icon:'assets/record-mood.png' },
  { label:'症状', value:'腰酸、疲惫', icon:'assets/record-symptom.png' },
];

function buildScene2Round2Answer(){
  return [
    { type:'done', text:'已记录' },
    { type:'record', text:'', record:{ time:formatScene2RecordTime(), rows:SCENE2_ROUND2_ROWS } },
    { type:'h', text:'这几项一起看' },
    { type:'li', text:'经期前两天雌激素处于低位，容易犯困、乏力，心情也会比平时平淡' },
    { type:'li', text:'腰酸多和经期盆腔充血、前列腺素升高有关，一般经期结束前后会缓解' },
    { type:'p', text:'你上个周期的这两天也记过「疲惫」，看起来是你经期比较固定的表现，不用太担心。' },
    { type:'h', text:'今天可以这样安排' },
    { type:'li', text:'别硬扛，午后小睡 20 分钟比一直撑着更能缓解疲惫' },
    { type:'li', text:'腰酸时热敷腰骶部，少久坐，别弯腰搬重物' },
    { type:'li', text:'多喝温水，晚餐加点含铁的食物，比如菠菜、瘦肉' },
    { type:'p', text:'今晚早点休息。明天起来记一笔睡得怎么样，我帮你看看疲惫和睡眠有没有关系。' },
  ];
}

// 第四轮：语音纠正之前记录的流量（中等 → 大量）。
// 确认操作直接放在模型输出的内容里（同方案3 在记录卡反馈模块里的做法），不再弹窗。
const SCENE2_ROUND4_TEXT = '刚才说错了，今天流量应该是大量';
const SCENE2_ROUND4_CONFIRM_PROMPT = [
  { type:'confirm', text:'' },
];
const SCENE2_ROUND4_CANCEL_ANSWER = [
  { type:'p', text:'好的，那就保持原来的记录。想改的时候随时跟我说。' },
];

function buildScene2Round4ConfirmAnswer(){
  return [
    { type:'done', text:'已修改' },
    { type:'record', text:'', record:{ time:formatScene2RecordTime(), rows:[
      { label:'流量', value:'大量', icon:'assets/record-flow.png' },
    ] } },
    { type:'p', text:'流量已从中等改成大量，点滴时间轴上的记录也同步更新了。' },
  ];
}

// 找到时间轴上最近一条带「流量」的记录，并把它改成大量
function findLatestFlowEntry(blocks){
  let hit = null;
  (blocks || []).forEach(block=>{
    if(block.type !== 'day') return;
    (block.items || block.entries || []).forEach(it=>{
      if((it.periodDetails || []).some(d=>d.label === '流量')) hit = it;
    });
  });
  return hit;
}

function applyChatFlowCorrection(blocks){
  const target = findLatestFlowEntry(blocks);
  if(!target) return blocks;
  return blocks.map(block=>{
    if(block.type !== 'day') return block;
    const items = block.items || block.entries || [];
    if(!items.some(it=>it.id === target.id)) return block;
    return {
      ...block,
      entries:undefined,
      items:items.map(it=>(it.id !== target.id ? it : {
        ...it,
        periodDetails:(it.periodDetails || []).map(d=>(d.label === '流量' ? { ...d, value:'大量' } : d)),
      })),
    };
  });
}

// 场景2 对话的追问轮次：按住说话依次发出，最后一轮之后重复最后一轮
const SCENE2_ROUNDS = [
  { text:SCENE1_FOLLOWUP_TEXT, buildAnswer:buildScene2FollowupAnswer, record:'period' },
  { text:SCENE2_ROUND2_TEXT, buildAnswer:buildScene2Round2Answer, record:'mood' },
  { text:SCENE2_ROUND4_TEXT, correction:true },
];

// 场景4「本次月经分析」对话的追问轮次：内容同场景2，但落轴改为文字记录卡
const SCENE4_ROUNDS = [
  { text:SCENE1_FOLLOWUP_TEXT, buildAnswer:buildScene2FollowupAnswer, record:'flow-card' },
  { text:SCENE2_ROUND2_TEXT, buildAnswer:buildScene2Round2Answer, record:'mood-card' },
  { text:SCENE2_ROUND4_TEXT, correction:true },
];

// 追问落轴的文字记录卡：原话 + 标签，沿用时间轴文字记录卡样式
function createScene2TextRecordEntry(idPrefix, text, tags){
  const id = idPrefix + '-' + Date.now();
  return {
    kind:'record-group',
    id:id + '-g',
    isNew:true,
    primary:{ id, time:window.formatNowTime(), kind:'text', text, tags },
  };
}

function createScene2MoodEntry(){
  return createScene2TextRecordEntry('s2-mood', SCENE2_ROUND2_TEXT, [
    { cat:'心情', icon:'mood', val:'' },
    { cat:'症状', icon:'sym', val:'' },
  ]);
}

// 场景4：对话里记录的内容，时间轴上只展示记录卡片（不保留用户原话），
// 沿用时间轴经期记录卡的行样式，但不带「月经来了」那一行
function createScene4RecordEntry(idPrefix, details){
  return {
    kind:'sync-card',
    id:idPrefix + '-' + Date.now(),
    isNew:true,
    time:window.formatNowTime(),
    recordSummary:true,
    hidePeriodLabel:true,
    periodDetails:details,
  };
}

function createScene4FlowRecordEntry(){
  return createScene4RecordEntry('s4-flow', [
    { label:'流量', value:'中等', icon:'flow' },
    { label:'痛经', value:'轻微', icon:'cramps' },
  ]);
}

function createScene4MoodRecordEntry(){
  return createScene4RecordEntry('s4-mood', [
    { label:'心情', value:'一般', icon:'mood' },
    { label:'症状', value:'腰酸、疲惫', icon:'symptom' },
  ]);
}

// 场景4：原本在点滴 tab 内联展开的「本次月经分析」，改到二级对话页流式输出
// 文案沿用 timeline-sister-cards.jsx 的 SISTER_LEAD / SISTER_PARA1 / SISTER_CLOSING；
// 原卡片里的三周期柱状图在对话页里改为三行文字
const SCENE4_PERIOD_ANALYSIS = [
  { type:'p', text:'以下是本次月经情况的分析。先看一下你最近 3 个周期的情况：' },
  { type:'li', text:'上上次 30 天，准时' },
  { type:'li', text:'上次 31 天，准时' },
  { type:'li', text:'本次 29 天，推迟 2 天' },
  { type:'p', text:'你最近三次周期分别是 30天、31天、29天，整体波动幅度很小，属于非常规律的状态。' },
  { type:'p', text:'这次周期天数落在 21–35天的理想范围内。很棒哦，继续保持现在的健康生活节奏就可以。' },
  { type:'p', text:'对了，今天的流量和痛经情况怎么样？说给我听，我帮你记下来。' },
];

// 场景4：反馈内容下方追问栏「为什么这次推迟了 2 天？」的回答。
// 反馈已经在点滴 tab 里给过规律性结论，这里只解释推迟这一件事，不重复分析。
const SCENE4_PERIOD_DELAY = [
  { type:'p', text:'推迟 2 天在你的周期里属于正常波动，不用担心。' },
  { type:'p', text:'月经推迟最常见的原因有这几个：' },
  { type:'li', text:'作息变化 —— 熬夜、睡眠不足会影响激素节律' },
  { type:'li', text:'压力和情绪 —— 近期紧张、焦虑都可能让排卵推后' },
  { type:'li', text:'体重和运动量的短期变化' },
  { type:'p', text:'你最近三次周期是 30天、31天、29天，波动都在 2 天以内，属于很稳的状态。医学上只要周期在 21–35 天之间、前后波动不超过 7 天，都算规律。' },
  { type:'p', text:'如果接下来连续 2 次都推迟超过 7 天，再来找我看看，我会帮你对比这几个周期的记录。' },
  { type:'p', text:'对了，今天的流量和痛经情况怎么样？说给我听，我帮你记下来。' },
];

// 追问栏「假期出行要准备什么？」的回答
const SCENE4_HOLIDAY_TIPS = [
  { type:'p', text:'按 10月3日 前后来算，假期前半段你大概率正好在经期头两天，也是量最多、最容易不舒服的时候。' },
  { type:'h', text:'出发前放进行李' },
  { type:'li', text:'卫生用品按平时用量多带 1–2 天的份' },
  { type:'li', text:'常用止痛药，以及一片暖宝宝' },
  { type:'li', text:'一条深色长裤或裙子，坐长途更安心' },
  { type:'h', text:'行程上可以调一调' },
  { type:'li', text:'把爬山、长时间暴走这类安排尽量放到假期后半段' },
  { type:'li', text:'长途车程中间留出能去洗手间的时间' },
  { type:'p', text:'临近出发我会再提醒你一次。到时候身体有什么反应，随时说给我听。' },
];

// 进二级页时带入的「上一轮」= 时间轴上的原输入 + 那条即时反馈本身。
// 用 feedback 块原样渲染时间轴的反馈模块（含柱状图、信号灯、台历），不做文字版复刻。
const SCENE1_ANALYSIS_FEEDBACK = [
  { type:'feedback', text:'', kind:'period-start' },
];
const SCENE1_FORECAST_FEEDBACK = [
  { type:'feedback', text:'', kind:'period-forecast' },
];

function resolveScene1Context(key){
  if(key === 'analysis-feedback') return SCENE1_ANALYSIS_FEEDBACK;
  if(key === 'forecast-feedback') return SCENE1_FORECAST_FEEDBACK;
  return null;
}

// 追问「我的经期规律么？」的回答。上一轮已经把三周期数据摆出来了，
// 这里只给结论和判断标准，不重复图表内容。
const SCENE1_REGULARITY_ANSWER = [
  { type:'p', text:'规律的。判断标准是周期落在 21–35 天之间、相邻两次相差不超过 7 天。' },
  { type:'p', text:'你最近三次是 30天、31天、29天，最大差值只有 2 天，比大多数人都稳。这次推迟 2 天在正常波动范围内，不用担心。' },
  { type:'p', text:'对了，今天的流量和痛经情况怎么样？说给我听，我帮你记下来。' },
];

// 场景2 追问「经期这几天要注意什么？」的回答
const SCENE2_CARE_ANSWER = [
  { type:'p', text:'经期前两天子宫收缩最明显，注意腹部保暖，少碰生冷和咖啡。' },
  { type:'p', text:'出血量大的时候别安排剧烈运动，晚餐可以加点含铁的食物，比如菠菜、瘦肉。' },
  { type:'p', text:'对了，今天的流量和痛经情况怎么样？说给我听，我帮你记下来。' },
];

function resolveScene1Answer(answerKey){
  if(answerKey === 'scene2') return SCENE2_ANSWER;
  if(answerKey === 'period-analysis') return SCENE1_REGULARITY_ANSWER;
  if(answerKey === 'period-delay') return SCENE4_PERIOD_DELAY;
  if(answerKey === 'holiday-tips') return SCENE4_HOLIDAY_TIPS;
  if(answerKey === 'period-care') return SCENE2_CARE_ANSWER;
  return SCENE1_ANSWER;
}

function createScene1AskEntry(options = {}){
  const now = Date.now();
  const completed = !!options.completed;
  const splitFeedback = !!options.splitFeedback;
  return {
    kind:'scene1-ask-record',
    id:completed ? 's1-ask-done' : 's1-ask-' + now,
    isNew:!completed,
    time:options.time || window.formatNowTime(),
    text:SCENE1_QUESTION,
    tags:[{ cat:'月经来了' }],
    // 反馈模块直接流式输出「本次月经分析」（与记录 tab 点横幅进来的内容同一套），
    // 不再用一条对话栏把用户送去二级页
    periodAnalysis:'period-start',
    splitFeedback,
    feedbackInCard:!!options.feedbackInCard,
    collapseOnLeave:!!options.collapseOnLeave,
    // 反馈播完后接一条追问栏；点进去是二级页 4 轮对话
    followUpEntry:{
      title:'我的经期规律么？',
      question:'我的经期规律么？',
      answerKey:'period-analysis',
      // 不带入上一轮，进二级页就是干净的一问一答
      // 聊过之后按钮变「查看：月经规律性分析」，位置不动
      threadTitleText:'月经规律性分析',
    },
    // 用时间戳而非本地计时，卡片重新挂载（如切 Tab 回来）不会重播加载态
    extractDoneAt:completed ? 0 : now + SCENE1_EXTRACT_MS,
  };
}

// 方案3 第一轮：一句话里同时带记录和症状
const SCENE1_PLAN3_QUESTION = '今天月经来了，肚子有点痛，目前血量比较小';

function createScene1Plan3AskEntry(options = {}){
  const now = Date.now();
  return {
    kind:'scene1-ask-record',
    id:'s1-p3-' + now,
    isNew:true,
    time:window.formatNowTime(),
    text:SCENE1_PLAN3_QUESTION,
    // 提取结果写成「✓ 已记录：」一行，标签样式
    tags:[{ cat:'月经来了' }, { cat:'症状' }, { cat:'流量' }],
    recordSummary:true,
    periodAnalysis:'period-start',
    splitFeedback:true,
    feedbackInCard:true,
    feedbackLabel:'AI分析：',
    collapseOnLeave:!!options.collapseOnLeave,
    followUpEntry:{
      title:'我的经期规律么？',
      question:'我的经期规律么？',
      answerKey:'period-analysis',
      contextText:SCENE1_PLAN3_QUESTION,
      contextKey:'analysis-feedback',
      threadTitleText:'经期规律与今日症状',
    },
    extractDoneAt:now + SCENE1_EXTRACT_MS,
  };
}

// 场景2：一句话里既有记录又有提问。
// 记录照常落轴给反馈；问句不在轴里回答，变成反馈下方那一栏，点进二级页回答。
const SCENE2_RECORD_QUESTION = '今天月经来了，我月经规律么';

function createScene2RecordQuestionEntry(options = {}){
  const now = Date.now();
  return {
    kind:'scene1-ask-record',
    id:'s2-rq-' + now,
    isNew:true,
    time:window.formatNowTime(),
    text:SCENE2_RECORD_QUESTION,
    tags:[{ cat:'月经来了' }],
    // 用户自己问了规律性，反馈直接给规律分析，不再走「本次月经分析」那套
    periodAnalysis:'period-regularity',
    collapseOnLeave:!!options.collapseOnLeave,
    followUpEntry:{
      // 规律性已经在反馈里答完了，这里换一个模型抛的下一步问题
      title:'经期这几天要注意什么？',
      question:'经期这几天要注意什么？',
      answerKey:'period-care',
      threadTitleText:'经期规律与注意事项',
    },
    extractDoneAt:now + SCENE1_EXTRACT_MS,
  };
}

// 方案1 第二轮：时间轴里问「下次月经什么时候？」
// 纯提问，没有可提取的记录，所以不带标签；加载态结束后给预测反馈 + 追问栏
const SCENE1_FORECAST_QUESTION = '下次月经什么时候？';

function createScene1ForecastEntry(options = {}){
  const now = Date.now();
  return {
    kind:'scene1-ask-record',
    id:'s1-forecast-' + now,
    isNew:true,
    time:window.formatNowTime(),
    text:SCENE1_FORECAST_QUESTION,
    tags:[],
    periodAnalysis:'period-forecast',
    splitFeedback:!!options.splitFeedback,
    feedbackInCard:!!options.feedbackInCard,
    followUpEntry:{
      title:'假期出行要准备什么？',
      question:'假期出行要准备什么？',
      answerKey:'holiday-tips',

    },
    extractDoneAt:now + SCENE1_EXTRACT_MS,
  };
}

// 场景2：纯提问、无可提取的记录 —— 落轴 + 加载态后只展示对话入口（样式同场景1），不展示标签
function createScene2AskEntry(){
  const now = Date.now();
  return {
    kind:'scene1-ask-record',
    id:'s2-ask-' + now,
    isNew:true,
    time:window.formatNowTime(),
    text:SCENE2_QUESTION,
    tags:[],
    chatTitle:SCENE1_CHAT_TITLE,
    answerKey:'scene2',
    extractDoneAt:now + SCENE1_EXTRACT_MS,
  };
}

// 二级页追问提取出的结构化经期记录：沿用时间轴原生经期记录卡（sync-card → PeriodRecordSummary）
// 不带 periodSummaryLabel / analysisKind / cardLabel，避免触发经期分析、「经期感受」引导等联动
function createScene1PeriodEntry(options = {}){
  const completed = !!options.completed;
  return {
    kind:'sync-card',
    id:completed ? 's1-period-done' : 's1-period-' + Date.now(),
    isNew:!completed,
    time:options.time || window.formatNowTime(),
    tagLayout:'v3',
    tags:[{ label:'月经来了', cat:'period', val:'', icon:'period' }],
    periodDetails:[
      { label:'流量', value:'中等', icon:'flow' },
      { label:'痛经', value:'轻微', icon:'cramps' },
    ],
  };
}

// 场景3初始态：场景1整个交互播放完成后的时间轴 —— 今天追加提问卡（已提取）+ 原生经期记录卡
// 使用固定时间，保证每次进入场景3画面一致
const SCENE1_COMPLETED_TIMES = { ask:'09:30', period:'09:31' };
function appendScene1CompletedState(blocks){
  const todayId = blocks.find(b=>b.type === 'day' && b.isToday)?.id;
  let next = window.appendTimelineEntry(
    blocks,
    createScene1AskEntry({ completed:true, time:SCENE1_COMPLETED_TIMES.ask }),
    { dayId:todayId },
  );
  next = window.appendTimelineEntry(
    next,
    createScene1PeriodEntry({ completed:true, time:SCENE1_COMPLETED_TIMES.period }),
    { dayId:todayId },
  );
  return next;
}

// 对话内的记录卡片：日期时间 + 提取到的记录项
function Scene1ChatRecordCard({record}){
  const rows = record?.rows || [];
  return (
    <div className="s1-chat-record">
      {record?.time ? <div className="s1-chat-record-time">{record.time}</div> : null}
      {rows.map((row, i)=>(
        <div key={row.label + i} className="s1-chat-record-row">
          <img className="s1-chat-record-icon" src={row.icon} alt="" width="18" height="18" draggable={false}/>
          <span className="s1-chat-record-label">{row.label}</span>
          <span className="s1-chat-record-value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// 「已记录」前的对号图标：语义色用成功绿，不用品牌红
function Scene1CheckIcon({size = 18}){
  return (
    <svg className="s1-chat-done-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--my-success)"/>
      <path d="M7.5 12.4l3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Scene1LoadingDots(){
  return (
    <span className="s1-dots" aria-hidden="true"><i/><i/><i/></span>
  );
}

// 「记录提取中...」「AI分析中...」轮播加载态：时间轴卡片与对话页共用，何时结束由外部决定
function Scene1ExtractLoading(){
  const [copyIdx, setCopyIdx] = React.useState(0);

  React.useEffect(()=>{
    const rotate = setInterval(()=>{
      setCopyIdx(i=>(i + 1) % SCENE1_LOADING_COPY.length);
    }, SCENE1_LOADING_ROTATE_MS);
    return ()=>clearInterval(rotate);
  }, []);

  return (
    <div className="s1-ask-loading" role="status" aria-live="polite">
      <Scene1LoadingDots/>
      <span key={copyIdx} className="s1-ask-loading-text">{SCENE1_LOADING_COPY[copyIdx]}</span>
    </div>
  );
}

function Scene1ChatIcon({size = 22}){
  const gradId = 's1-chat-grad-' + React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6aa0"/>
          <stop offset="52%" stopColor="#ff4d88"/>
          <stop offset="100%" stopColor="#b85cff"/>
        </linearGradient>
      </defs>
      <path
        d="M12 3.5c4.97 0 9 3.36 9 7.5s-4.03 7.5-9 7.5c-.9 0-1.77-.11-2.6-.32L5.2 20.2a.6.6 0 01-.86-.66l.72-3.3C3.8 14.93 3 13.03 3 11c0-4.14 4.03-7.5 9-7.5z"
        fill={'url(#' + gradId + ')'}
      />
      <circle cx="8.2" cy="11" r="1.15" fill="#fff"/>
      <circle cx="12" cy="11" r="1.15" fill="#fff"/>
      <circle cx="15.8" cy="11" r="1.15" fill="#fff"/>
    </svg>
  );
}

// 对话栏标题逐字输出（与场景4 一致）：仅卡片新落轴时播放，重新挂载不重播
const scene1ChatTitleStreamed = new Set();

// 方案2：反馈从记录卡里拆出来单独成卡。
// 无标题，正文前缀「💬 AI反馈：」；正文播完后在下一行给出追问按钮（按钮在卡内）。
// 聊过并从二级页返回后，整张卡收缩成一个对话按钮，只留图标 + 主题标题。
function Scene1FeedbackCard({entry, isNew, inline}){
  const kind = entry.periodAnalysis === true ? 'period-start' : entry.periodAnalysis;
  const followUp = entry.followUpEntry || {};
  const threadTitle = followUp.threadTitle;
  const [done, setDone] = React.useState(!isNew);
  const [expanded, setExpanded] = React.useState(false);
  const rootRef = React.useRef(null);

  const openChat = ()=>{
    window.dispatchEvent(new CustomEvent('openScene1Chat', {
      detail:{
        question: followUp.question,
        title: followUp.title,
        entryId: entry.id,
        answerKey: followUp.answerKey,
        context: followUp.contextKey
          ? { text: followUp.contextText, key: followUp.contextKey }
          : undefined,
      },
    }));
  };

  // 追问按钮出现在输入栏底下会看不见，出现时自己滚进可视区
  React.useLayoutEffect(()=>{
    if(!done || !isNew || !rootRef.current) return;
    const raf = requestAnimationFrame(()=>window.scrollFeedContentIntoView?.(rootRef.current));
    return ()=>cancelAnimationFrame(raf);
  }, [done, isNew]);

  // 聊过之后的折叠态：
  // 卡内（方案2）→ 追问栏形态，无边框、通栏一行
  // 卡外（方案3）→ 独立的轻量按钮，样式同追问按钮
  // 方案3：没点追问就切走 Tab，回来时也收起 —— 此时还没有对话，
  // 折叠行显示反馈本身的名字（「AI分析」），点开是展开反馈而不是进二级页
  const collapsedOnly = !threadTitle && entry.feedbackCollapsed && !expanded;
  if(collapsedOnly && inline){
    const label = (entry.feedbackLabel || 'AI反馈：').replace(/[：:]$/, '');
    return (
      <button type="button" className="s1-fb-row" onClick={()=>setExpanded(true)}>
        <span className="s1-fb-icon">
          {window.Scene1ChatIcon ? <window.Scene1ChatIcon size={22}/> : null}
        </span>
        <span className="s1-fb-row-title">{label}</span>
        <svg className="s1-fb-row-arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </button>
    );
  }

  if(threadTitle){
    if(inline){
      return (
        <button type="button" className="s1-fb-row" onClick={openChat}>
          <span className="s1-fb-icon">
            {window.Scene1ChatIcon ? <window.Scene1ChatIcon size={22}/> : null}
          </span>
          <span className="s1-fb-row-title">{threadTitle}</span>
          <svg className="s1-fb-row-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </button>
      );
    }
    return (
      <button type="button" className="s1-fb-thread" onClick={openChat}>
        <span className="s1-fb-icon">
          {window.Scene1ChatIcon ? <window.Scene1ChatIcon size={16}/> : null}
        </span>
        <span className="s1-fb-thread-title">{threadTitle}</span>
        <svg className="s1-fb-thread-arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </button>
    );
  }

  const Body = kind === 'period-forecast'
    ? window.SisterForecastContent
    : window.SisterAnalysisContent;

  return (
    <section
      className={(inline ? 's1-fb-inline' : 's1-fb-card')
        + (entry.recordSummary ? ' is-compact-label' : '')
        + (isNew ? ' fade-in' : '')}
      ref={rootRef}
    >
      <div className="s1-fb-inner tl-t5-insight">
        <span className="s1-fb-label">
          <span className="s1-fb-icon">
            {window.Scene1ChatIcon ? <window.Scene1ChatIcon size={20}/> : null}
          </span>
          {entry.feedbackLabel || 'AI反馈：'}
        </span>
        {Body ? (
          <Body
            key={isNew ? 'anim' : 'static'}
            playAnimation={isNew ? 1 : 0}
            animateText={!!isNew}
            analysisKind={kind}
            showPeriodFeelPrompt={false}
            onCycleComplete={()=>setDone(true)}
          />
        ) : null}
      </div>
      {done && followUp.title ? (
        <button type="button" className="s1-fb-ask" onClick={openChat}>
          追问：{followUp.title}
        </button>
      ) : null}
    </section>
  );
}

function Scene1AskRecordCard({entry, isNew}){
  const [extracting, setExtracting] = React.useState(()=>Date.now() < (entry.extractDoneAt || 0));

  React.useEffect(()=>{
    if(!extracting) return;
    const done = setTimeout(()=>setExtracting(false), Math.max(0, entry.extractDoneAt - Date.now()));
    return ()=>clearTimeout(done);
  }, [extracting, entry.extractDoneAt]);

  const openChat = ()=>{
    window.dispatchEvent(new CustomEvent('openScene1Chat', {
      detail:{ question:entry.text, title:entry.chatTitle, entryId:entry.id, completed:!!entry.chatCompleted, answerKey:entry.answerKey },
    }));
  };

  const V3v2Header = window.V3v2Header;
  const TLTag = window.TLTag;
  // 完成态（场景3初始态）标签与入口直接展示，只有新落轴的卡片才做淡入
  const revealCls = isNew ? ' s1-reveal' : '';
  const [streamChatTitle] = React.useState(()=>{
    if(!isNew || !entry.id) return false;
    if(scene1ChatTitleStreamed.has(entry.id)) return false;
    scene1ChatTitleStreamed.add(entry.id);
    return true;
  });
  const hasTags = (entry.tags || []).length > 0;
  // v2 场景3：修改流量的确认改在这张卡的反馈模块里做，不再弹窗
  const flowConfirm = entry.flowConfirm;
  // 方案1：反馈模块里流式输出即时反馈，播完接追问栏
  // periodAnalysis 取 'period-start'（本次月经分析）或 'period-forecast'（下次月经预测）；
  // 老数据写的是 true，兼容为 period-start
  const SisterAnalysisCollapsible = window.SisterAnalysisCollapsible;
  const analysisKind = entry.periodAnalysis === true ? 'period-start' : entry.periodAnalysis;
  const splitFeedback = !!entry.splitFeedback;
  // 方案2：反馈整体放在记录卡内，用分割线与上方内容隔开
  const feedbackInCard = splitFeedback && !!entry.feedbackInCard;
  const showPeriodAnalysis = !!analysisKind && !!SisterAnalysisCollapsible && !splitFeedback;
  // 无标签、无对话入口、无反馈、也没有待确认的修改：加载结束后只保留原话
  const textOnly = !extracting && !hasTags && !entry.chatTitle && !flowConfirm && !showPeriodAnalysis && !splitFeedback;

  const recordCard = (
    <div className={'s1-ask-card' + (isNew ? ' fade-in' : '') + (textOnly ? ' is-text-only' : '')} data-entry-id={entry.id}>
      {V3v2Header ? <V3v2Header time={entry.time}/> : null}
      <div className="s1-ask-body">{entry.text}</div>

      {extracting ? (
        <Scene1ExtractLoading/>
      ) : (
        <>
          {hasTags ? (
            entry.recordSummary ? (
              <>
              <div className="s1-ask-divider" role="separator"/>
              <div className={'s1-ask-recorded' + revealCls}>
                <span className="s1-ask-recorded-icon"><Scene1CheckIcon/></span>
                <span className="s1-ask-recorded-label">已记录：</span>
                <span className="s1-ask-recorded-tags">
                  {TLTag ? entry.tags.map((tag, i)=><TLTag key={i} tag={tag}/>) : null}
                </span>
              </div>
              </>
            ) : (
              <div className={'s1-ask-tags' + revealCls}>
                {TLTag ? entry.tags.map((tag, i)=><TLTag key={i} tag={tag}/>) : null}
              </div>
            )
          ) : null}
          {showPeriodAnalysis ? (
            <SisterAnalysisCollapsible
              playAnimation={isNew ? 1 : 0}
              animateText={!!isNew}
              periodStyle
              analysisKind={analysisKind}
              showPeriodFeelPrompt={false}
              followUpEntry={entry.followUpEntry}
              followUpHostId={entry.id}
              followUpIsNew={!!isNew}
              collapsed={!!entry.feedbackCollapsed}
            />
          ) : null}
          {flowConfirm && window.Scene3FlowConfirmInline ? (
            <div className={'s1-ask-feedback' + revealCls}>
              <div className="s1-ask-divider" role="separator"/>
              <window.Scene3FlowConfirmInline
                target={entry.flowConfirmTarget}
                entryId={entry.id}
                state={flowConfirm}
              />
            </div>
          ) : null}
          {feedbackInCard ? (
            <>
              {entry.recordSummary ? null : <div className="s1-ask-divider" role="separator"/>}
              <Scene1FeedbackCard entry={entry} isNew={isNew} inline/>
            </>
          ) : null}
          {entry.chatTitle ? (
            <>
              <div className="s1-ask-divider" role="separator"/>
              <button type="button" className={'s1-ask-chat-entry' + revealCls} onClick={openChat}>
                <span className="s1-ask-chat-icon"><Scene1ChatIcon/></span>
                <span className="s1-ask-chat-title">
                  {streamChatTitle && window.TypewriterText
                    ? <window.TypewriterText text={entry.chatTitle} active charMs={90}/>
                    : entry.chatTitle}
                </span>
                <svg className="s1-ask-chat-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 6l6 6-6 6"/>
                </svg>
              </button>
            </>
          ) : null}
        </>
      )}
    </div>
  );

  if(!splitFeedback || feedbackInCard) return recordCard;
  // 记录卡（原话 + 标签）+ 反馈卡，两张卡上下排布
  return (
    <>
      {recordCard}
      {!extracting ? <Scene1FeedbackCard entry={entry} isNew={isNew}/> : null}
    </>
  );
}

function countScene1Chars(blocks){
  return blocks.reduce((sum, block)=>sum + block.text.length, 0);
}

function renderScene1AnswerBlocks(blocks, shownChars, streaming){
  let remaining = shownChars;
  const out = [];
  for(let i = 0; i < blocks.length; i++){
    const block = blocks[i];
    // remaining < 0：前一块还没输出完，后面的先不出
    if(remaining < 0) break;
    // 零字数的块（确认操作区）不占字数，等它前面的文字都输出完再出现
    if(remaining === 0 && block.text) break;
    const visible = block.text.slice(0, remaining);
    remaining -= block.text.length;
    const isTail = streaming && remaining <= 0 && !!block.text;
    const caret = isTail ? <span className="ai-caret"/> : null;
    if(block.type === 'feedback'){
      // 原样渲染时间轴上的反馈模块（含图表）。包一层 .tl-t5-insight 才能吃到那套卡片样式；
      // animateText=false 直接出完成态，不重播流式。
      const Body = block.kind === 'period-forecast'
        ? window.SisterForecastContent
        : window.SisterAnalysisContent;
      out.push(
        <div key={i} className="tl-t5-insight s1-chat-feedback">
          {Body ? (
            <Body
              playAnimation={0}
              animateText={false}
              analysisKind={block.kind}
              showPeriodFeelPrompt={false}
            />
          ) : null}
        </div>
      );
    } else if(block.type === 'confirm'){
      out.push(
        <window.Scene3FlowConfirmInline
          key={i}
          state={block.state || 'pending'}
          onResolve={(confirmed)=>window.dispatchEvent(new CustomEvent('scene1ChatFlowResolve', { detail:{ confirmed } }))}
        />
      );
    } else if(block.type === 'record'){
      out.push(<Scene1ChatRecordCard key={i} record={block.record}/>);
    } else if(block.type === 'done'){
      out.push(
        <div key={i} className="s1-chat-done">
          <Scene1CheckIcon/>
          <span>{visible}{caret}</span>
        </div>
      );
    } else if(block.type === 'h'){
      out.push(<div key={i} className="s1-chat-h">{visible}{caret}</div>);
    } else if(block.type === 'li'){
      out.push(<div key={i} className="s1-chat-li">{visible}{caret}</div>);
    } else {
      out.push(<p key={i} className="s1-chat-p">{visible}{caret}</p>);
    }
  }
  return out;
}

// 单条 AI 回复：loadingUntil 之前展示提取加载态，随后流式输出，结束后展示「内容由 AI 生成」
// instant：直接展示全文（完成态）
// initialShown：已输出过的字数 —— 返回点滴页再进入时从这里继续，已输出的内容不重复流式输出
function Scene1AiMessage({blocks, loadingUntil = 0, instant = false, initialShown = 0, onShown, onProgress, onDone}){
  const total = React.useMemo(()=>countScene1Chars(blocks), [blocks]);
  const [loading, setLoading] = React.useState(()=>!instant && Date.now() < loadingUntil);
  const [shown, setShown] = React.useState(()=>(instant ? total : Math.min(initialShown, total)));
  // blocks 为空：等待确认弹窗结果，继续显示加载态
  const waiting = !blocks.length;
  const done = !loading && !waiting && shown >= total;
  const onProgressRef = React.useRef(onProgress);
  const onDoneRef = React.useRef(onDone);
  const onShownRef = React.useRef(onShown);
  onProgressRef.current = onProgress;
  onDoneRef.current = onDone;
  onShownRef.current = onShown;

  React.useEffect(()=>{
    if(!loading) return;
    const timer = setTimeout(()=>setLoading(false), Math.max(0, loadingUntil - Date.now()));
    return ()=>clearTimeout(timer);
  }, [loading, loadingUntil]);

  React.useEffect(()=>{
    if(loading || waiting) return;
    if(done){
      onDoneRef.current?.();
      return;
    }
    const timer = setTimeout(()=>{
      setShown(n=>Math.min(total, n + 1 + Math.floor(Math.random() * 3)));
    }, SCENE1_STREAM_TICK_MS);
    return ()=>clearTimeout(timer);
  }, [loading, waiting, shown, total, done]);

  React.useEffect(()=>{
    onShownRef.current?.(shown);
  }, [shown]);

  React.useLayoutEffect(()=>{
    onProgressRef.current?.();
  }, [loading, shown]);

  return (
    <div className="s1-chat-msg is-ai">
      <div className="s1-chat-ai">
        {(loading || waiting) ? (
          <Scene1ExtractLoading/>
        ) : (
          <div className="s1-chat-answer" aria-live="polite" aria-busy={!done}>
            {renderScene1AnswerBlocks(blocks, shown, !done)}
          </div>
        )}
        {done ? (
          <div className="s1-chat-disclaimer s1-reveal">内容由 AI 生成</div>
        ) : null}
      </div>
    </div>
  );
}

// 二级页底部输入栏：沿用点滴页 Dock 的胶囊输入框（dock-input-pill），不含快捷记录按钮
// busy 时（AI 正在回复）按住说话不响应，与点滴页演示中的 isDemoRunning 一致
function Scene1ChatInput({busy = false, onVoiceDone}){
  const Icon = window.Icon;
  const DockVoiceCircleIco = window.DockVoiceCircleIco;
  const DockKbdCircleIco = window.DockKbdCircleIco;
  const DockWavePlaceholder = window.DockWavePlaceholder;
  const [inputMode, setInputMode] = React.useState('voice');
  const [draft, setDraft] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  // 用 ref 记录录音状态：按下后立刻松开时 state 还没更新，也能正确触发发送
  const recordingRef = React.useRef(false);

  const startRec = ()=>{
    if(busy) return;
    recordingRef.current = true;
    setRecording(true);
  };
  const stopRec = ()=>{
    if(!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    onVoiceDone?.();
  };
  const cancelRec = ()=>{
    recordingRef.current = false;
    setRecording(false);
  };

  return (
    <div className="s1-chat-dock">
      <div className="dock-bar is-path-dock">
        <div className="dock-input-row dock-input-pill">
          <button
            type="button"
            className="dock-mode-btn"
            onClick={()=>setInputMode(m=>m === 'text' ? 'voice' : 'text')}
            aria-label={inputMode === 'text' ? '切换语音' : '切换键盘'}
          >
            {inputMode === 'text'
              ? (DockVoiceCircleIco ? <DockVoiceCircleIco size={26}/> : null)
              : (DockKbdCircleIco ? <DockKbdCircleIco size={26}/> : null)}
          </button>

          {inputMode === 'text' ? (
            <div className={'dock-text-field' + (focused ? ' is-focused' : '')}>
              {DockWavePlaceholder ? <DockWavePlaceholder show={!draft.trim()} focused={focused}/> : null}
              <textarea
                rows="1"
                placeholder=""
                aria-label="输入内容"
                value={draft}
                onChange={(e)=>{
                  setDraft(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 72) + 'px';
                }}
                onFocus={()=>setFocused(true)}
                onBlur={()=>setFocused(false)}
              />
            </div>
          ) : (
            <div className={'dock-voice-wrap' + (recording ? ' is-recording' : '')}>
              <div className="dock-voice-stage" aria-hidden="true">
                <span className="dock-voice-shimmer"/>
              </div>
              <button
                type="button"
                className={'dock-voice-btn' + (recording ? ' recording' : '')}
                onPointerDown={(e)=>{ e.preventDefault(); startRec(); }}
                onPointerUp={stopRec}
                onPointerLeave={recording ? stopRec : undefined}
                onPointerCancel={cancelRec}
              >
                {recording ? (
                  <>
                    <span className="dock-voice-waves" aria-hidden="true">
                      {[4,8,12,8,6,10,7].map((h, j)=><span key={j} style={{height:h + 'px'}}/>)}
                    </span>
                    <span>松开 结束</span>
                  </>
                ) : (
                  <span className="dock-voice-label">按住 说话</span>
                )}
              </button>
            </div>
          )}

          {inputMode === 'text' && draft.trim() ? (
            <button type="button" className="dock-send-btn" aria-label="发送">
              {Icon ? <Icon name="send" size={16} stroke={2}/> : null}
            </button>
          ) : null}

          <button type="button" className="dock-camera-btn" aria-label="智能拍照记录">
            {Icon ? <Icon name="camera" size={22} stroke={1.7}/> : null}
          </button>
        </div>
      </div>
    </div>
  );
}

// 对话历史缓存：按时间轴卡片 id 保存消息列表与每条 AI 回复已输出的字数
// 返回点滴页再进入时直接展示已输出的内容，没输出完的从断点继续；切换场景时由 app.jsx 调用 resetScene1ChatStore 清空
const scene1ChatStore = new Map();

function resetScene1ChatStore(){
  scene1ChatStore.clear();
}

function getScene1ChatSession(key, completed, question, answerKey, context){
  if(!scene1ChatStore.has(key)){
    // 带入上一轮：时间轴上的原输入 + 那条即时反馈，直接展示不重播
    const ctxBlocks = context && resolveScene1Context(context.key);
    const ctxMessages = (context && context.text && ctxBlocks) ? [
      { id:'ctx-u', role:'user', text:context.text },
      { id:'ctx-a', role:'ai', blocks:ctxBlocks, instant:true },
    ] : [];
    // completed：场景3初始态，直接是场景1播放完成后的完整对话，不再加载、不再流式输出
    const messages = completed ? [
      { id:'u-0', role:'user', text:question },
      { id:'a-0', role:'ai', blocks:SCENE1_ANSWER, instant:true },
      { id:'u-1', role:'user', text:SCENE1_FOLLOWUP_TEXT },
      { id:'a-1', role:'ai', blocks:SCENE1_FOLLOWUP_ANSWER, instant:true },
    ] : [
      ...ctxMessages,
      { id:'u-0', role:'user', text:question },
      { id:'a-0', role:'ai', blocks:resolveScene1Answer(answerKey) },
    ];
    scene1ChatStore.set(key, { messages, shown:{} });
  }
  return scene1ChatStore.get(key);
}

function isScene1MessageDone(msg, session){
  if(msg.role !== 'ai' || msg.instant) return true;
  return Date.now() >= (msg.loadingUntil || 0)
    && (session.shown[msg.id] || 0) >= countScene1Chars(msg.blocks);
}

function Scene1ChatPage({question, title, completed = false, entryId, answerKey, context, onBack, onRecord, onCorrection}){
  const [session] = React.useState(()=>getScene1ChatSession(entryId || question, completed, question, answerKey, context));
  const [messages, setMessages] = React.useState(session.messages);
  const [replying, setReplying] = React.useState(()=>session.messages.some(msg=>!isScene1MessageDone(msg, session)));
  const scrollRef = React.useRef(null);
  const onRecordRef = React.useRef(onRecord);
  onRecordRef.current = onRecord;
  const onCorrectionRef = React.useRef(onCorrection);
  onCorrectionRef.current = onCorrection;
  // 第四轮纠正：等确认弹窗结果回来后，再把回复内容填进这条 AI 消息
  const pendingCorrectionIdRef = React.useRef(null);

  const scrollToBottom = React.useCallback(()=>{
    const el = scrollRef.current;
    if(el) el.scrollTop = el.scrollHeight;
  }, []);
  const handleReplyDone = React.useCallback(()=>setReplying(false), []);

  const handleVoiceDone = ()=>{
    if(replying) return;
    const now = Date.now();
    // 按轮次发送：流量/痛经 → 心情/症状 → 纠正流量（弹确认弹窗）；之后重复最后一轮
    // 场景1、场景2 用同一套；场景4 只有落轴的记录形式不同
    const askedCount = session.messages.filter(m=>m.role === 'user').length - 1;
    const isScene4Key = answerKey === 'period-analysis' || answerKey === 'period-delay'
      || answerKey === 'period-care' || answerKey === 'holiday-tips';
    const rounds = isScene4Key ? SCENE4_ROUNDS : SCENE2_ROUNDS;
    const round = rounds[Math.min(askedCount, rounds.length - 1)];
    const aiId = 'a-' + now;
    const next = [
      ...session.messages,
      { id:'u-' + now, role:'user', text:round.text },
      {
        id:aiId,
        role:'ai',
        blocks:round.correction ? SCENE2_ROUND4_CONFIRM_PROMPT : round.buildAnswer(),
        loadingUntil:now + SCENE1_EXTRACT_MS,
      },
    ];
    session.messages = next;
    setMessages(next);
    setReplying(true);
    if(round.correction){
      // 确认操作区已经随这条回复一起输出，等用户点确认 / 取消再替换内容
      pendingCorrectionIdRef.current = aiId;
      return;
    }
    // 记录的落轴时机由 App 层计时（与加载态同步），返回点滴页也不会取消
    onRecordRef.current?.(round.record);
  };

  React.useEffect(()=>{
    const onResult = (e)=>{
      const id = pendingCorrectionIdRef.current;
      if(!id) return;
      pendingCorrectionIdRef.current = null;
      const blocks = e.detail && e.detail.confirmed
        ? buildScene2Round4ConfirmAnswer()
        : SCENE2_ROUND4_CANCEL_ANSWER;
      setMessages(list=>{
        const next = list.map(m=>(m.id === id ? { ...m, blocks } : m));
        session.messages = next;
        return next;
      });
    };
    window.addEventListener('scene1FlowCorrectionResult', onResult);
    return ()=>window.removeEventListener('scene1FlowCorrectionResult', onResult);
  }, [session]);

  React.useLayoutEffect(scrollToBottom, [messages.length, scrollToBottom]);

  return (
    <div className="s1-chat-page" role="dialog" aria-label={title}>
      <header className="s1-chat-nav">
        <button type="button" className="s1-chat-back" onClick={onBack} aria-label="返回">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <div className="s1-chat-title">{title}</div>
        <div className="s1-chat-nav-spacer"/>
      </header>

      <div className="s1-chat-scroll" ref={scrollRef}>
        {messages.map((msg)=>(
          msg.role === 'user' ? (
            <div key={msg.id} className="s1-chat-msg is-user s1-reveal">
              <div className="s1-chat-bubble">{msg.text}</div>
            </div>
          ) : (
            <Scene1AiMessage
              key={msg.id}
              blocks={msg.blocks}
              loadingUntil={msg.loadingUntil}
              instant={msg.instant}
              initialShown={session.shown[msg.id] || 0}
              onShown={(n)=>{ session.shown[msg.id] = n; }}
              onProgress={scrollToBottom}
              onDone={handleReplyDone}
            />
          )
        ))}
      </div>

      <Scene1ChatInput busy={replying} onVoiceDone={handleVoiceDone}/>
    </div>
  );
}

Object.assign(window, {
  SCENE1_EXTRACT_MS,
  createScene1AskEntry,
  createScene2AskEntry,
  createScene2MoodEntry,
  createScene4FlowRecordEntry,
  createScene4MoodRecordEntry,
  findLatestFlowEntry,
  applyChatFlowCorrection,
  createScene1PeriodEntry,
  appendScene1CompletedState,
  createScene2RecordQuestionEntry,
  createScene1Plan3AskEntry,
  Scene1FeedbackCard,
  resolveScene1Context,
  createScene1ForecastEntry,
  resetScene1ChatStore,
  Scene1AskRecordCard,
  Scene1ChatIcon,
  Scene1ChatPage,
});
