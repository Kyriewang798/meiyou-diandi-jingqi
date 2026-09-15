// Demo 场景配置（v2）— 控制默认 Tab、页面展示与交互流程
//
// v2 在页面顶部中央提供「场景1 / 场景2 / 场景3」切换。
// 三个场景都基于 v1 的「记录心情反馈」配置；场景3 的初始时间轴额外叠加场景1整个交互的播放完成态。

function buildBaseScene(id, label, options = {}){
  return {
    id,
    label,
    description: '',
    defaultTab: 'note',
    identity: 'period',
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
  'scene-1': buildBaseScene('scene-1', '场景1'),
  'scene-2': buildBaseScene('scene-2', '场景2'),
  // 场景3：以场景1整个交互的播放完成态作为初始态
  'scene-3': buildBaseScene('scene-3', '场景3', {
    extendTimeline:(blocks)=>window.appendScene1CompletedState ? window.appendScene1CompletedState(blocks) : blocks,
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
