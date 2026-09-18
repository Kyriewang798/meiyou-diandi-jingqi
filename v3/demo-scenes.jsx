// Demo 场景配置（v2）— 控制默认 Tab、页面展示与交互流程
//
// v3 在页面顶部中央提供「方案1 / 方案2 / 方案3」切换。
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
    // splitFeedback：反馈从记录卡里拆出来（方案2 / 方案3）
    splitFeedback: !!options.splitFeedback,
    // feedbackInCard：反馈整体放在记录卡内，用分割线与上方内容隔开（方案2 / 方案3）
    feedbackInCard: !!options.feedbackInCard,
    // recordSummary：提取结果写成「✓ 已记录：标签 标签」一行（方案3）
    recordSummary: !!options.recordSummary,
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

const DEFAULT_DEMO_SCENE = 'plan-1';

const DEMO_SCENES = {
  // 方案1：反馈在记录卡内，带「本次月经分析」折叠标题 + 追问胶囊
  'plan-1': buildBaseScene('plan-1', '方案1', { voiceFlow:'ask', collapseOnLeave:true }),
  // 方案2：记录卡只放原话和标签，反馈无标题、以「AI反馈：」起头，追问按钮在卡内；
  //        聊过之后折叠成卡内的追问栏形态
  'plan-2': buildBaseScene('plan-2', '方案2', {
    voiceFlow:'ask', splitFeedback:true, feedbackInCard:true,
  }),
  // 方案3：一句话同时带记录和症状 →「✓ 已记录：标签」+「💬 AI分析：…」两行；
  //        没点追问就切走再回来，AI分析自动收起
  'plan-3': buildBaseScene('plan-3', '方案3', {
    voiceFlow:'ask', splitFeedback:true, feedbackInCard:true,
    recordSummary:true, collapseOnLeave:true,
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
