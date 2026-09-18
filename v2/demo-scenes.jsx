// Demo 场景配置（v2）— 控制默认 Tab、页面展示与交互流程
//
// v2 在页面顶部中央提供「场景1 / 场景2 / 场景3」切换。
//
// 交互差异不再按场景 id 硬判断，改用下面这两个标志位，加新方案只要配一行：
//   voiceFlow  'ask'     语音落轴 → 提取标签 → 即时反馈 + 追问栏
//              'correct' 语音落轴 → 提取 → 在反馈模块里确认修改（流量 中等 → 大量）
//              null      走通用记录流程
//   askVariant 'record-ask'    有可提取的记录（「今天月经开始了」）
//              'question-only' 纯提问，无可提取记录

function buildBaseScene(id, label, options = {}){
  return {
    id,
    label,
    description: '',
    defaultTab: 'note',
    identity: 'period',
    voiceFlow: options.voiceFlow || null,
    askVariant: options.askVariant || 'record-ask',
    // askFactory：'record-question' 时用「记录 + 提问」那条落轴文案（场景2）
    askFactory: options.askFactory || null,
    // collapseOnLeave：切走 Tab 再回来，反馈自动收起
    collapseOnLeave: !!options.collapseOnLeave,
    getTimeline: ()=>{
      const blocks = JSON.parse(JSON.stringify(window.TIMELINE_BLOCKS));
      blocks.forEach(block=>{
        if(block.type !== 'day') return;
        (block.items || []).forEach(it=>{
          if(it?.kind === 'guide' && it.id === 'g-518-post') it.noAnimate = true;
        });
      });
      return options.extendTimeline ? options.extendTimeline(blocks) : blocks;
    },
    calendar: {
      enabled: true,
      periodFlow: true,
    },
    floatNotice: {
      enabled: true,
    },
    record: {
      showHealthCard: false,
      sisterAnalysis: {
        trigger: 'float-notice',
        initialDone: true,
      },
      todayGuide: true,
      recordFeedback: true,
    },
  };
}

const DEFAULT_DEMO_SCENE = 'scene-1';

const DEMO_SCENES = {
  // 场景1：只记录 —— 「今天月经开始了」→ 标签 + 即时反馈 + 追问栏
  'scene-1': buildBaseScene('scene-1', '场景1', {
    voiceFlow:'ask', collapseOnLeave:true,
  }),
  // 场景2：记录 + 提问 —— 「今天月经来了，我月经规律么」
  //        记录照常落轴给反馈，问句变成反馈下方那一栏，点进二级页回答
  'scene-2': buildBaseScene('scene-2', '场景2', {
    voiceFlow:'ask', askFactory:'record-question', collapseOnLeave:true,
  }),
  // 场景3：纠正已有记录 —— 「刚才记错了，今天经血量比较大」
  //        初始态先摆一条可被改的经期记录
  'scene-3': buildBaseScene('scene-3', '场景3', {
    voiceFlow:'correct',
    extendTimeline:(blocks)=>(window.appendScene3InitialState
      ? window.appendScene3InitialState(blocks) : blocks),
  }),
};

const DEMO_SCENE_OPTIONS = Object.values(DEMO_SCENES).map((s) => ({
  value: s.id,
  label: s.label,
}));

function getDemoScene(id){
  return DEMO_SCENES[id] || DEMO_SCENES[DEFAULT_DEMO_SCENE];
}

function isVoiceTranscribeScene(id){
  const scene = getDemoScene(id);
  return scene.mode === 'voice-transcribe';
}

function getSceneInitialState(id){
  const scene = getDemoScene(id);
  return {
    activeTab: scene.defaultTab,
    timeline: scene.getTimeline(),
    showAnalysisNotice: false,
    sisterPlayAnimation: 0,
    sisterCycleDone: scene.record.sisterAnalysis.initialDone,
    hideTodayGuide: false,
    draft: '',
  };
}

Object.assign(window, {
  DEMO_SCENES,
  DEMO_SCENE_OPTIONS,
  getDemoScene,
  getSceneInitialState,
  isVoiceTranscribeScene,
});

// v2 顶部场景切换条（页面顶部居中）
function DemoSceneBar({ value, onChange, description }) {
  const options = window.DEMO_SCENE_OPTIONS;
  return (
    <div className="v2-scene-bar" role="toolbar" aria-label="演示场景切换">
      <span className="v2-scene-bar-tag">v2</span>
      <div className="v2-scene-bar-options">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={'v2-scene-bar-btn' + (value === opt.value ? ' active' : '')}
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {description && <p className="v2-scene-bar-hint">{description}</p>}
    </div>
  );
}

Object.assign(window, { DemoSceneBar });
