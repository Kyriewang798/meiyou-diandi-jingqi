const { useState, useEffect, useRef } = React;
const PERIOD_START_NOTICE_TITLE = '本次周期29天，结合近期记录为你生成周期分析';
const BABY_VOICE_DEMO_TEXT = '今天早上喂奶喂了60ml';
const DEFAULT_REVIEW_SHARE_STATE = {
  status:'idle',
  partnerName:'',
  invitedAt:'',
  acceptedAt:'',
  modules:{cycle:true, period:true, care:true, mood:false, symptom:false, weight:false, intimate:false},
};

function PeriodFeelOverlay({open, onClose, onComplete, label='经期感受'}){
  const [state, setState] = React.useState('ready');
  const [text, setText] = React.useState('');
  const [scheme1ExampleIndex, setScheme1ExampleIndex] = React.useState(0);
  const timers = React.useRef([]);
  const examples = [
        <><span>“今天</span><strong>流量</strong><span>特别大”</span></>,
        <><span>“这次</span><strong>痛经</strong><span>比上次严重”</span></>,
        <><span>“经前1天</span><strong>胸部胀痛</strong><span>”</span></>,
      ];
  const demoText = '今天早上量不多，下午量变大了，晚上血量特别大，月经开始的前一天特别烦躁，感觉胸部一直胀胀的';
  const clearTimers = ()=>{ timers.current.forEach(clearTimeout); timers.current=[]; };
  React.useEffect(()=>{
    if(!open){ clearTimers(); setState('ready'); setText(''); return; }
    clearTimers(); setState('ready'); setText('');
    return clearTimers;
  }, [open]);
  React.useEffect(()=>{
    if(!open) return;
    setScheme1ExampleIndex(0);
    const timer = setInterval(()=>setScheme1ExampleIndex(index=>(index + 1) % 3), 1800);
    return ()=>clearInterval(timer);
  }, [open]);
  if(!open) return null;
  const DockPublisher = window.DockPublisher;
  return ReactDOM.createPortal(
    <div className="period-feel-overlay is-scheme1 is-compact" role="dialog" aria-modal="true" aria-label="经期感受">
      <div className="period-feel-sheet">
        <div className="period-feel-nav"><button type="button" onClick={onClose} aria-label="关闭">×</button><span>{label}</span></div>
        {state === 'result' ? (
          <div className="period-feel-result">
            <h2>共识别5条记录</h2>
            <div className="period-feel-result-card"><p>“{demoText}”</p><b>月经前1天</b><div className="period-result-pre-tags"><span className="period-result-pre-item"><span className="v3-tag" data-cat="心情">心情</span><span className="period-result-value">烦躁</span></span><span className="period-result-pre-item"><span className="v3-tag" data-cat="症状">症状</span><span className="period-result-value">乳房胀痛</span></span></div><b>月经第1天</b><div><span className="period-result-pre-item"><span className="v3-tag" data-cat="经期">流量</span><span className="period-result-value">早上少量、下午中量、晚上特别大量</span></span></div></div>
            <div className="period-feel-result-actions"><button type="button" onClick={()=>onComplete?.(demoText)}>保存</button></div>
          </div>
        ) : (
          <><div className="period-feel-top is-scheme1-content">{state === 'recording' ? <p className="period-feel-live-text">{text}<span className="period-feel-caret"/></p> : <><div className="period-feel-intro"><span className="period-feel-demo-mic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg></span><div><b>试着说：</b></div></div><div className="period-feel-example-carousel" aria-live="polite"><p key={scheme1ExampleIndex}>{examples[scheme1ExampleIndex]}</p></div></>}</div><div className="period-feel-real-dock is-scheme1-motion">{DockPublisher ? <DockPublisher draft="" onDraft={()=>{}} onSend={()=>{}} onQuickMark={()=>{}} onMoodConfirm={()=>{}} onSymptomConfirm={()=>{}} onWeightConfirm={()=>{}} onFoodConfirm={()=>{}} onDietCapture={()=>{}} onCameraRecord={()=>{}} onVoiceDone={()=>{clearTimers(); onComplete?.(demoText);}} onVoiceStart={()=>{clearTimers(); setState('recording'); let i=0; const timer=setInterval(()=>{i+=1; setText(demoText.slice(0,i)); if(i>=demoText.length) clearInterval(timer);},65); timers.current.push(timer);}} onPhoto={()=>{}} onDockExpandedChange={()=>{}} activeTab="note" defaultInputMode="voice" hideQuickFan hideQuickFab/> : null}</div></>
        )}
      </div>
    </div>, document.body
  );
}

function shouldShowAnalysis(hits, analysis){
  if(!analysis || !hits.length) return false;
  if(analysis.tone === 'warn') return true;
  if(hits.some(h=>h.kind==='period')) return true;
  return false;
}

function buildTimelineEntry(text, hits, opts={}){
  const analysis = hits.length ? window.chooseAnalysis(hits) : null;
  const toneMap = { warn:'yellow', brand:'brand', good:'green' };
  const tags = opts.tags || window.buildT5TagsFromText(text, hits);
  const entry = {
    id:'e-'+Date.now(),
    kind: opts.voice ? 'voice-card' : 'rec',
    time: window.formatNowTime(),
    isNew: true,
    tags,
    tagLayout: opts.tagLayout || 't5',
  };
  if(opts.voice){
    entry.voice = opts.voice;
    entry.voiceText = text;
  } else {
    entry.body = text;
  }
  if(shouldShowAnalysis(hits, analysis)){
    entry.aiNote = {
      tone: toneMap[analysis.tone] || 'green',
      icon: analysis.points?.[0]?.icon || '💡',
      text: analysis.points?.map(p=>p.text).join(' ') || analysis.title,
    };
  }
  if(opts.quickTag){
    entry.tags = [{ label: opts.quickTag.label, cat:'symptom', emoji: opts.quickTag.emoji }, ...entry.tags];
  }
  return entry;
}

function BabyVoiceOverlay({session, success}){
  const waveBars = React.useMemo(()=>Array.from({length:26}, (_, i)=>({
    delay: (i * 0.05).toFixed(2) + 's',
    duration: (0.72 + (i % 5) * 0.08).toFixed(2) + 's',
  })), []);
  const text = BABY_VOICE_DEMO_TEXT.slice(0, session.textLength || 0);
  return (
    <>
      <div
        className={
          'baby-voice-overlay'
          + (session.active ? ' is-listening' : '')
          + (session.cancel ? ' is-cancel' : '')
        }
        aria-hidden={!session.active}
      >
        <div className="baby-voice-listening">
          <span className="baby-listen-dot"></span>
          <span className="baby-listen-text">请说，我在听…</span>
        </div>
        <div className="baby-voice-text">
          {text}
          {session.active ? <span className="baby-voice-cursor"></span> : null}
        </div>
        <div className="baby-voice-dock">
          <div className="baby-voice-hint">{session.cancel ? '松开取消' : '松开发送　　上滑取消'}</div>
          <div className="baby-voice-bar">
            {waveBars.map((bar, i)=>(
              <span
                key={i}
                className="baby-wave"
                style={{animationDelay:bar.delay, animationDuration:bar.duration}}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={'baby-voice-success-toast' + (success.show ? ' is-show' : '')}>
        <span className="baby-voice-toast-check">✓</span>
        <div>
          <div className="baby-voice-toast-title">记录成功</div>
          <div className="baby-voice-toast-sub">可以在喂养记录或点滴查看</div>
        </div>
      </div>
    </>
  );
}

const BABY_FEEDING_QUICK_ITEMS = [
  { id: 'formula', label: '配方奶', cardIcon:'🍼', iconSrc:'assets/baby-feeding-icons/formula.png', color:'#FF7A66', value:'130ml', text:'配方奶：130ml' },
  { id: 'breast', label: '母乳', cardIcon:'🤱', iconSrc:'assets/baby-feeding-icons/breast.png', color:'#FF8EB8', value:'20分钟', text:'母乳', leftMinutes:10, rightMinutes:10 },
  { id: 'bottle-breast', label: '瓶喂母乳', cardIcon:'🍼', iconSrc:'assets/baby-feeding-icons/bottle-breast.png', color:'#FF8EB8', value:'90ml', text:'瓶喂母乳：90ml' },
  { id: 'diaper', label: '换尿布', cardIcon:'🧷', iconSrc:'assets/baby-feeding-icons/diaper.png', color:'#E8A23D', value:'臭臭 墨绿色、膏状', text:'换尿布：臭臭 墨绿色、膏状' },
  { id: 'sleep', label: '睡眠', cardIcon:'🌙', iconSrc:'assets/baby-feeding-icons/sleep.png', color:'#8E7BD9', value:'4小时52分钟', text:'睡眠', durationMinutes:292 },
  { id: 'nutrition', label: '营养补剂', cardIcon:'💊', iconSrc:'assets/baby-feeding-icons/nutrition.png', color:'#3CB88C', value:'维生素D3，50mg', text:'营养补剂：维生素D3，50mg' },
  { id: 'water', label: '喝水', cardIcon:'💧', iconSrc:'assets/baby-feeding-icons/water.png', color:'#5B8DEF', value:'50ml', text:'喝水：50ml' },
  { id: 'pump', label: '吸奶', cardIcon:'🍼', iconSrc:'assets/baby-feeding-icons/pump.png', color:'#7BC7D8', value:'100ml', text:'吸奶：100ml' },
  { id: 'solid-food', label: '辅食', cardIcon:'🥣', iconSrc:'assets/baby-feeding-icons/solid-food.png', color:'#F2A65A', value:'米粉，菠菜，20g', text:'辅食：米粉，菠菜，20g' },
  { id: 'bath', label: '洗澡', cardIcon:'🛁', iconSrc:'assets/baby-feeding-icons/bath.png', color:'#5FCAD1', value:'13分钟', text:'洗澡', durationMinutes:13 },
  { id: 'play', label: '玩耍', cardIcon:'🧸', iconSrc:'assets/baby-feeding-icons/play.png', color:'#F4B45F', value:'30分钟', text:'玩耍', durationMinutes:30 },
  { id: 'swim', label: '游泳', cardIcon:'🏊', iconSrc:'assets/baby-feeding-icons/swim.png', color:'#4AA9E9', value:'20分钟', text:'游泳', durationMinutes:20 },
  { id: 'mood', label: '心情', cardIcon:'⭐', iconSrc:'assets/baby-feeding-icons/other-event.png', color:'#9B6BE8', value:'开心', text:'心情：开心' },
  { id: 'weight', label: '体重', cardIcon:'⭐', iconSrc:'assets/baby-feeding-icons/other-event.png', color:'#9B6BE8', value:'4.6kg', text:'体重：4.6kg' },
  { id: 'diet', label: '饮食', cardIcon:'⭐', iconSrc:'assets/baby-feeding-icons/other-event.png', color:'#9B6BE8', value:'已记录', text:'饮食：已记录' },
  { id: 'temperature', label: '体温', cardIcon:'⭐', iconSrc:'assets/baby-feeding-icons/other-event.png', color:'#9B6BE8', value:'36.8℃', text:'体温：36.8℃' },
  { id: 'symptom', label: '症状', cardIcon:'⭐', iconSrc:'assets/baby-feeding-icons/other-event.png', color:'#9B6BE8', value:'无异常', text:'症状：无异常' },
];

const PERIOD_DOCK_QUICK_ITEMS = [
  { id:'weight', label:'体重', action:'weight', iconSrc:'assets/record-weight.png' },
  { id:'symptom', label:'症状', action:'symptom', iconSrc:'assets/record-symptom.png' },
  { id:'mood', label:'心情', action:'mood', iconSrc:'assets/record-mood.png' },
  { id:'diet', label:'饮食', action:'diet', iconSrc:'assets/record-diet.png' },
  { id:'beverage', label:'喝水', action:'beverage', iconSrc:'assets/record-beverage.svg', text:'喝水' },
  { id:'custom', label:'自定义', text:'自定义' },
  { id:'stool', label:'便便', iconSrc:'assets/record-stool.svg', text:'便便' },
  { id:'exercise', label:'运动', icon:'🏃', text:'运动' },
  { id:'sleep', label:'睡眠', icon:'🌙', text:'睡眠' },
  { id:'medicine', label:'吃药', icon:'💊', text:'吃药' },
  { id:'habit', label:'好习惯', icon:'✅', text:'好习惯' },
  { id:'diary', label:'日记', icon:'📔', text:'日记' },
  { id:'checkup', label:'体检单', icon:'🩺', text:'体检单' },
  { id:'account', label:'记账', icon:'💰', text:'记账' },
  { id:'travel', label:'旅行', icon:'✈️', text:'旅行' },
  { id:'pet', label:'宠物', icon:'🐾', text:'宠物' },
];

function CustomQuickIcon(){
  return (
    <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
      <defs>
        <radialGradient id="custom-quick-bg" cx="50%" cy="34%" r="72%">
          <stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#f0f8e9"/>
        </radialGradient>
        <linearGradient id="custom-quick-body" x1="18" y1="14" x2="47" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#b6dd8a"/><stop offset="52%" stopColor="#93c95f"/><stop offset="100%" stopColor="#6ba83a"/>
        </linearGradient>
        <radialGradient id="custom-quick-highlight"><stop stopColor="#fff" stopOpacity=".95"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#custom-quick-bg)"/>
      <ellipse cx="32" cy="51" rx="15" ry="4.6" fill="#6ba83a" opacity=".22"/>
      <rect x="14" y="14" width="36" height="36" rx="12" fill="url(#custom-quick-body)"/>
      <path d="M26 14h12a12 12 0 0 1 12 12v2c0-6.6-5.4-12-12-12H26c-6.6 0-12 5.4-12 12v-2a12 12 0 0 1 12-12z" fill="#fff" opacity=".3"/>
      <g fill="#fff"><rect x="29.4" y="21.6" width="5.2" height="20.8" rx="2.6"/><rect x="21.6" y="29.4" width="20.8" height="5.2" rx="2.6"/></g>
      <ellipse cx="23.4" cy="22.6" rx="5.4" ry="3.4" fill="url(#custom-quick-highlight)" transform="rotate(-22 23.4 22.6)"/>
    </svg>
  );
}

function BabyFeedingQuickIcon({type}){
  if(type === 'breast'){
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="bf-breast" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd6e8"/><stop offset="100%" stopColor="#ff8eb8"/></linearGradient></defs>
        <rect width="48" height="48" rx="24" fill="url(#bf-breast)"/>
        <path d="M16 30c0-5 3-9 8-9s8 4 8 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="24" cy="18" r="5.5" fill="#fff" opacity="0.95"/>
        <path d="M20 24c1.5 2 5.5 2 8 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if(type === 'formula'){
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="bf-formula" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe2bf"/><stop offset="100%" stopColor="#ffad5c"/></linearGradient></defs>
        <rect width="48" height="48" rx="24" fill="url(#bf-formula)"/>
        <rect x="17" y="12" width="14" height="22" rx="4" fill="#fff" opacity="0.95"/>
        <path d="M20 16h8M20 20h8" stroke="#ffb36a" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="33" cy="30" r="4" fill="#fff" opacity="0.9"/>
      </svg>
    );
  }
  if(type === 'bottle-breast'){
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="bf-bottle" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd6e8"/><stop offset="100%" stopColor="#ff8eb8"/></linearGradient></defs>
        <rect width="48" height="48" rx="24" fill="url(#bf-bottle)"/>
        <path d="M22 12h4v4h-4z" fill="#fff"/>
        <path d="M19 16h10v18a5 5 0 0 1-10 0V16z" fill="#fff" opacity="0.95"/>
        <path d="M21 24h6" stroke="#ffb8d2" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if(type === 'diaper'){
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="bf-diaper" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff0c9"/><stop offset="100%" stopColor="#ffc96a"/></linearGradient></defs>
        <rect width="48" height="48" rx="24" fill="url(#bf-diaper)"/>
        <path d="M14 24c0-6 4.5-10 10-10s10 4 10 10v8H14v-8z" fill="#fff" opacity="0.95"/>
        <path d="M18 24h12" stroke="#ffd27f" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if(type === 'sleep'){
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="bf-sleep" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e8dcff"/><stop offset="100%" stopColor="#b58cff"/></linearGradient></defs>
        <rect width="48" height="48" rx="24" fill="url(#bf-sleep)"/>
        <path d="M30 18a8 8 0 1 0-10 10 10 10 0 0 1 10-10z" fill="#fff" opacity="0.95"/>
        <circle cx="31" cy="30" r="3" fill="#fff" opacity="0.75"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id="bf-nutrition" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d8f8ef"/><stop offset="100%" stopColor="#6edfc0"/></linearGradient></defs>
      <rect width="48" height="48" rx="24" fill="url(#bf-nutrition)"/>
      <path d="M24 12c3 6 8 9 8 14a8 8 0 1 1-16 0c0-5 5-8 8-14z" fill="#fff" opacity="0.95"/>
    </svg>
  );
}

function BabyFeedingQuickStrip(){
  return (
    <section className="baby-feeding-quick-strip" aria-label="宝宝喂养快捷记录">
      <div className="baby-feeding-quick-scroll">
        {BABY_FEEDING_QUICK_ITEMS.map((item)=>(
          <button key={item.id} type="button" className="baby-feeding-quick-item">
            <span className="baby-feeding-quick-icon">
              <BabyFeedingQuickIcon type={item.id}/>
            </span>
            <span className="baby-feeding-quick-label">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BabyFeedingDiscoverCard({onClose}){
  return (
    <section className="tl-baby-discover-card" aria-label="点滴育儿记录能力发现">
      <button
        type="button"
        className="tl-baby-discover-close"
        aria-label="关闭发现卡片"
        onClick={onClose}
      >
        ×
      </button>
      <div className="tl-baby-discover-title">
        ✨ 点滴现在也能记录<span>宝宝喂养</span>了
      </div>
      <p className="tl-baby-discover-sub">语音输入，自动识别归档</p>
      <div className="tl-baby-discover-feedback">
        <div className="tl-baby-discover-feedback-text">
          <button className="tl-voice-pill is-compact tl-baby-discover-voice" type="button" aria-label="播放语音 6秒">
            <span className="tl-voice-pill-ico" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="currentColor"><path d="M4 2.5v7l5-3.5-5-3.5z"/></svg>
            </span>
            <span className="tl-voice-pill-dur">6″</span>
          </button>
          <span>今天早上喂了60ml配方奶</span>
        </div>
        <div className="tl-baby-discover-feedback-tags">
          <span className="tl-baby-discover-feed-main">🍼 小豆苗的喂养记录</span>
          <span className="tl-baby-discover-feed-chip">配方奶</span>
        </div>
      </div>
    </section>
  );
}

function App(){
  const demoMode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('demo')
    : '';
  const focusedInputDemo = demoMode === 'focused-input-flow-v1' || demoMode === 'focused-input-flow-v2';
  const focusedInputPathsDemo = demoMode === 'focused-input-flow-v2';
  const [t, setTweak] = window.useTweaks({...window.__TWEAK_DEFAULTS});
  const [emptyPreviewMode, setEmptyPreviewMode] = useState(null);
  const [emptyPreviewGuideStep, setEmptyPreviewGuideStep] = useState(0);
  const scene = window.getDemoScene(t.demoScene);
  const noteScene = React.useMemo(() => {
    if (!emptyPreviewMode) return scene;
    return {
      ...scene,
      record: {
        ...scene.record,
        blankState: true,
        blankScheme: 1,
        blankScheme1Preview: emptyPreviewMode === 'no-data',
        emptyPreviewWithData: emptyPreviewMode === 'with-data',
        emptyPreview: true,
        emptyState: false,
        todayGuide: false,
      },
    };
  }, [scene, emptyPreviewMode]);

  React.useEffect(() => {
    if (!emptyPreviewMode) {
      setEmptyPreviewGuideStep(0);
      return undefined;
    }
    const tm = setTimeout(() => setEmptyPreviewGuideStep(1), 600);
    return () => clearTimeout(tm);
  }, [emptyPreviewMode]);

  const advanceEmptyPreviewGuide = React.useCallback(() => {
    setEmptyPreviewGuideStep((step) => (step === 1 ? 2 : step === 2 ? 3 : step));
  }, []);

  const dismissEmptyPreviewGuide = React.useCallback(() => {
    setEmptyPreviewGuideStep(3);
  }, []);
  const voiceTranscribe = !!scene.record?.voiceTranscribe;
  const ctx = window.SCENE_CONTEXT[scene.identity] || window.SCENE_CONTEXT.period;

  const initial = window.getSceneInitialState(t.demoScene);
  const [draft, setDraft] = useState(initial.draft);
  const [timeline, setTimeline] = useState(initial.timeline);
  const [toasts, setToasts] = useState([]);
  const [showPhoto, setShowPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState(()=>{
    if(typeof location !== 'undefined'){
      const params = new URLSearchParams(location.search);
      if(params.get('feeding') === '1') return 'note';
      const tab = params.get('tab');
      if(tab && ['home', 'cal', 'note', 'cash', 'me'].includes(tab)) return tab;
    }
    return initial.activeTab;
  });
  const [reviewCycleOpenRequest, setReviewCycleOpenRequest] = useState(0);
  const [reviewCycleReturnTab, setReviewCycleReturnTab] = useState(null);
  const [reviewWeightOpenRequest, setReviewWeightOpenRequest] = useState(0);
  const [reviewWeightReturnTab, setReviewWeightReturnTab] = useState(null);
  const [reviewDietOpenRequest, setReviewDietOpenRequest] = useState(0);
  const [reviewDietReturnTab, setReviewDietReturnTab] = useState(null);
  const [reviewMoodOpenRequest, setReviewMoodOpenRequest] = useState(0);
  const [reviewMoodReturnTab, setReviewMoodReturnTab] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [recordLifeMode, setRecordLifeMode] = useState('经期');
  const [reviewShareState, setReviewShareState] = useState(DEFAULT_REVIEW_SHARE_STATE);
  const [partnerPreviewOpen, setPartnerPreviewOpen] = useState(false);
  const [babyVoiceSession, setBabyVoiceSession] = useState({active:false, cancel:false, textLength:0});
  const [babyVoiceSuccess, setBabyVoiceSuccess] = useState({show:false});
  const [babyVoiceCoachHidden, setBabyVoiceCoachHidden] = useState(false);
  const [babyDiscoverVisible, setBabyDiscoverVisible] = useState(()=>{
    if(typeof location !== 'undefined' && new URLSearchParams(location.search).get('feeding') === '1'){
      return false;
    }
    return false;
  });
  const [babyFeedingEntryActive, setBabyFeedingEntryActive] = useState(()=>{
    if(typeof location !== 'undefined' && new URLSearchParams(location.search).get('feeding') === '1'){
      return true;
    }
    return true;
  });
  const [showAnalysisNotice, setShowAnalysisNotice] = useState(initial.showAnalysisNotice);
  const [analysisNoticeTitle, setAnalysisNoticeTitle] = useState(PERIOD_START_NOTICE_TITLE);
  const [analysisNoticeKind, setAnalysisNoticeKind] = useState('period-start');
  const [sisterPlayAnimation, setSisterPlayAnimation] = useState(initial.sisterPlayAnimation);
  const [sisterCycleDone, setSisterCycleDone] = useState(initial.sisterCycleDone);
  const [hideTodayGuide, setHideTodayGuide] = useState(initial.hideTodayGuide);
  const [periodEndRecordReady, setPeriodEndRecordReady] = useState(false);
  const [periodEndRecordCompleted, setPeriodEndRecordCompleted] = useState(false);
  const [periodDetailRecordEnabled, setPeriodDetailRecordEnabled] = useState(false);
  const [periodDetailDraft, setPeriodDetailDraft] = useState({});
  const [healthRecordDrafts, setHealthRecordDrafts] = useState([]);
  const [noteTabUnread, setNoteTabUnread] = useState(false);
  const [periodFeelVisible, setPeriodFeelVisible] = useState(false);
  const [periodFeelReady, setPeriodFeelReady] = useState(false);
  const [periodFeelGuideVisible, setPeriodFeelGuideVisible] = useState(false);
  const [periodFeelRecorded, setPeriodFeelRecorded] = useState(false);
  const [periodFeelModalOpen, setPeriodFeelModalOpen] = useState(false);
  const [dockExpanded, setDockExpanded] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [babyFeedingPanelMode, setBabyFeedingPanelMode] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState(null);

  React.useEffect(()=>{
    const handleOpenReviewCycle = ()=>{
      setReviewCycleOpenRequest(request=>request + 1);
      setReviewCycleReturnTab('note');
      setRecordLifeMode('经期');
      setActiveTab('cash');
    };
    const handleOpenReviewWeight = ()=>{
      setReviewWeightOpenRequest(request=>request + 1);
      setReviewWeightReturnTab('note');
      setActiveTab('cash');
    };
    const handleOpenReviewDiet = ()=>{
      setReviewDietOpenRequest(request=>request + 1);
      setReviewDietReturnTab('note');
      setActiveTab('cash');
    };
    const handleOpenReviewMood = ()=>{
      setReviewMoodOpenRequest(request=>request + 1);
      setReviewMoodReturnTab('note');
      setActiveTab('cash');
    };
    window.addEventListener('openReviewCycleDetail', handleOpenReviewCycle);
    window.addEventListener('openReviewWeightDetail', handleOpenReviewWeight);
    window.addEventListener('openReviewDietDetail', handleOpenReviewDiet);
    window.addEventListener('openReviewMoodDetail', handleOpenReviewMood);
    return ()=>{
      window.removeEventListener('openReviewCycleDetail', handleOpenReviewCycle);
      window.removeEventListener('openReviewWeightDetail', handleOpenReviewWeight);
      window.removeEventListener('openReviewDietDetail', handleOpenReviewDiet);
      window.removeEventListener('openReviewMoodDetail', handleOpenReviewMood);
    };
  }, []);

  const scheme3FirstVisitRef = useRef(null);
  const searchCloseScrollRef = useRef(null);
  const streamRef = useRef(null);
  const timelineEndRef = useRef(null);
  const recordEnterModeRef = useRef('idle');
  const periodRecordRef = useRef(null);
  const firstRecordAnimDoneRef = useRef(false);
  const moodGuideQueueRef = useRef(null);
  const dropLandRevealRef = useRef(false);
  const [firstDropAnim, setFirstDropAnim] = useState(null);
  const babyVoiceStartYRef = useRef(0);
  const babyVoiceActiveRef = useRef(false);
  const babyVoiceCancelRef = useRef(false);
  const babyVoiceHoldTimerRef = useRef(null);
  const babyVoiceTimerRef = useRef(null);
  const babyVoiceSuccessTimerRef = useRef(null);
  const babyFeedingCardInsertedRef = useRef(false);
  const babyFeedingQuickGuardRef = useRef({id:null, at:0});

  const recordFeedback = !!scene.record.recordFeedback;

  // ====== 演示流程状态 ======
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoPhase, setDemoPhase] = useState(null); // null | 'listening' | 'recognizing'
  const demoIdsRef = useRef([]); // 追踪演示卡片 id

  // 暴露重置函数给全局 resetDemo 按钮
  React.useEffect(()=>{
    window.__resetDemo = ()=>{
      if(!demoIdsRef.current.length) return;
      setTimeline(blocks=>blocks.map(b=>{
        if(b.type!=='day') return b;
        const items = (b.items||[]).filter(it=>!demoIdsRef.current.includes(it.id));
        return {...b, items, entries:undefined};
      }));
      demoIdsRef.current = [];
      setIsDemoRunning(false);
      setDemoPhase(null);
    };
  }, []);

  React.useEffect(()=>{
    const handler = ()=>{
      const fn = moodGuideQueueRef.current;
      moodGuideQueueRef.current = null;
      fn?.();
    };
    window.addEventListener('moodCardStreamDone', handler);
    return ()=>window.removeEventListener('moodCardStreamDone', handler);
  }, []);

  React.useEffect(()=>{
    const focusedRecordIds = [
      'focused-daughter-period-yesterday',
      'focused-baby-weight-today',
      'focused-self-mood-today',
      'focused-text-headache-today',
      'focused-text-nausea-today',
      'focused-text-stool-today',
    ];
    const onRetroRecordReady = (event)=>{
      const entry = event?.detail?.entry;
      const todayEntries = event?.detail?.todayEntries || [];
      if(!entry && !todayEntries.length) return;
      const stream = streamRef.current;
      const anchor = stream?.querySelector('[data-entry-id="focused-input-flow-current"]');
      const anchorTop = anchor?.getBoundingClientRect().top;
      const updateTimeline = ()=>setTimeline(blocks=>blocks.map(block=>{
        if(block.type !== 'day') return block;
        const items = block.items || block.entries || [];
        if(block.relativeLabel === '昨天' && entry){
          if(items.some(item=>item.id === entry.id)) return block;
          return {...block, items:[...items, entry], entries:undefined};
        }
        if(block.isToday && todayEntries.length){
          const pendingEntries = todayEntries.filter(candidate=>!items.some(item=>item.id === candidate.id));
          if(!pendingEntries.length) return block;
          const focusedEntryIndex = items.findIndex(item=>item.id === 'focused-input-flow-current');
          const insertAt = focusedEntryIndex >= 0 ? focusedEntryIndex : items.length;
          const nextItems = [
            ...items.slice(0, insertAt),
            ...pendingEntries,
            ...items.slice(insertAt),
          ];
          return {...block, items:nextItems, entries:undefined};
        }
        return block;
      }));
      if(typeof ReactDOM.flushSync === 'function') ReactDOM.flushSync(updateTimeline);
      else updateTimeline();
      if(stream && Number.isFinite(anchorTop)){
        const nextAnchor = stream.querySelector('[data-entry-id="focused-input-flow-current"]');
        if(nextAnchor){
          stream.scrollTop += nextAnchor.getBoundingClientRect().top - anchorTop;
        }
      }
    };
    const onRetroRecordReset = ()=>{
      setTimeline(blocks=>blocks.map(block=>{
        if(block.type !== 'day') return block;
        const items = block.items || block.entries || [];
        if(!items.some(item=>focusedRecordIds.includes(item.id))) return block;
        return {...block, items:items.filter(item=>!focusedRecordIds.includes(item.id)), entries:undefined};
      }));
    };
    window.addEventListener('focusedDemoRetroRecordReady', onRetroRecordReady);
    window.addEventListener('focusedDemoRetroRecordReset', onRetroRecordReset);
    return ()=>{
      window.removeEventListener('focusedDemoRetroRecordReady', onRetroRecordReady);
      window.removeEventListener('focusedDemoRetroRecordReset', onRetroRecordReset);
    };
  }, []);

  React.useEffect(()=>{
    const onInsert = (event)=>{
      const kind = event?.detail?.kind;
      const entry = kind === 'not-food'
        ? window.createDietNotFoodDemoEntry?.()
        : window.createDietTimeoutDemoEntry?.();
      if(!entry) return;
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId?.('', timeline);
      if(!dayId) return;
      setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
      requestAnimationFrame(()=>{
        if(typeof window.scrollTimelineToBottom === 'function'){
          window.scrollTimelineToBottom('smooth');
        }
      });
    };
    window.addEventListener('dietRecognitionDemoInsert', onInsert);
    return ()=>window.removeEventListener('dietRecognitionDemoInsert', onInsert);
  }, [timeline]);

  React.useEffect(()=>{
    const onDisplayInsert = (event)=>{
      const entry = window.createDietFeedbackDisplayDemoEntry?.(event?.detail?.scenario);
      if(!entry) return;
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId?.('', timeline);
      if(!dayId) return;
      setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
      requestAnimationFrame(()=>{
        if(typeof window.scrollTimelineToBottom === 'function'){
          window.scrollTimelineToBottom('smooth');
        }
      });
    };
    window.addEventListener('dietFeedbackDisplayDemoInsert', onDisplayInsert);
    return ()=>window.removeEventListener('dietFeedbackDisplayDemoInsert', onDisplayInsert);
  }, [timeline]);

  React.useEffect(()=>{
    const onComboInsert = (event)=>{
      const entry = window.createDietFeedbackComboDemoEntry?.(event?.detail?.scenario || 'combo-ab');
      if(!entry) return;
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId?.('', timeline);
      if(!dayId) return;
      setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
      requestAnimationFrame(()=>{
        if(typeof window.scrollTimelineToBottom === 'function'){
          window.scrollTimelineToBottom('smooth');
        }
      });
    };
    window.addEventListener('dietFeedbackComboDemoInsert', onComboInsert);
    return ()=>window.removeEventListener('dietFeedbackComboDemoInsert', onComboInsert);
  }, [timeline]);

  const resetSceneState = (demoSceneId)=>{
    const next = window.getSceneInitialState(demoSceneId);
    setDraft(next.draft);
    setTimeline(next.timeline);
    setShowAnalysisNotice(next.showAnalysisNotice);
    setAnalysisNoticeTitle(PERIOD_START_NOTICE_TITLE);
    setAnalysisNoticeKind('period-start');
    setSisterPlayAnimation(next.sisterPlayAnimation);
    setSisterCycleDone(next.sisterCycleDone);
    setHideTodayGuide(next.hideTodayGuide);
    setPeriodEndRecordReady(false);
    setPeriodFeelVisible(false);
    setPeriodFeelReady(false);
    setPeriodFeelRecorded(false);
    setPeriodFeelModalOpen(false);
    setPeriodEndRecordCompleted(false);
    setHealthRecordDrafts([]);
    setActiveTab(next.activeTab);
    setShowPhoto(false);
    setShowSearchPage(false);
    setSearchCriteria(null);
    setReviewCycleOpenRequest(0);
    setReviewCycleReturnTab(null);
    periodRecordRef.current = null;
    scheme3FirstVisitRef.current = null;
    setFirstDropAnim(null);
    firstRecordAnimDoneRef.current = false;
    moodGuideQueueRef.current = null;
    dropLandRevealRef.current = false;
    babyFeedingCardInsertedRef.current = false;
    babyFeedingQuickGuardRef.current = {id:null, at:0};
    setBabyDiscoverVisible(false);
    setBabyFeedingEntryActive(true);
    setEmptyPreviewMode(null);
    setEmptyPreviewGuideStep(0);
  };

  useEffect(()=>{
    resetSceneState(t.demoScene);
  }, [t.demoScene]);

  const scrollToSisterAnalysis = ()=>{
    const tryScroll = (attempt)=>{
      const stream = streamRef.current;
      const el = document.getElementById('sister-analysis-anchor');
      if(stream && el){
        const top = el.getBoundingClientRect().top - stream.getBoundingClientRect().top + stream.scrollTop - 32;
        stream.scrollTo({ top: Math.max(0, top), behavior:'smooth' });
      } else if(el){
        el.scrollIntoView({ behavior:'smooth', block:'center' });
      } else if(attempt < 3){
        setTimeout(()=>tryScroll(attempt + 1), 300);
      }
    };
    requestAnimationFrame(()=>setTimeout(()=>tryScroll(0), 350));
  };

  const openSisterAnalysis = ()=>{
    if(scene.record.sisterAnalysis.trigger !== 'float-notice') return;
    recordEnterModeRef.current = 'analysis';
    setShowAnalysisNotice(false);
    const isPeriodEndAnalysis = analysisNoticeKind === 'period-end';
    if(!isPeriodEndAnalysis) setPeriodEndRecordReady(true);
    else setPeriodEndRecordCompleted(true);

    const periodRecord = periodRecordRef.current || {};
    const periodDetails = isPeriodEndAnalysis ? [] : [
      periodRecord.flow ? { label:'流量', value: periodRecord.flow, icon:'flow' } : null,
      periodRecord.color ? { label:'颜色', value: periodRecord.color, icon:'color' } : null,
      periodRecord.cramps ? { label:'痛经', value: periodRecord.cramps, icon:'cramps' } : null,
    ].filter(Boolean);
    const syncEntry = {
      kind:'sync-card', id:'e-period-'+Date.now(), time: window.formatNowTime(),
      cardLabel:'自动同步', cardLabelKind:'sync',
      body: isPeriodEndAnalysis ? '今天月经走喽。' : '今天月经来了。',
      tagLayout:'v3', isNew: true,
      tags:[{ label: isPeriodEndAnalysis ? '月经走喽' : '月经来了', cat:'period', val:'', icon:'period' }],
      periodDetails,
      periodSummaryLabel: isPeriodEndAnalysis ? '月经走喽' : '月经来了',
      analysisKind: isPeriodEndAnalysis ? 'period-end' : 'period-start',
    };
    const sisterEntry = {
      kind:'sister-card', id:'e-sister-'+Date.now(), time: window.formatNowTime(), railDot:'ai',
      analysisKind: isPeriodEndAnalysis ? 'period-end' : 'period-start',
      periodFeelPrompt: false,
      periodFeelGuideLabel: '经期感受',
    };
    const todayId = timeline.find(b=>b.type==='day' && b.isToday)?.id;
    setTimeline(blocks => {
      let result = window.appendTimelineEntry(blocks, syncEntry, { dayId: todayId });
      result = window.appendTimelineEntry(result, sisterEntry, { dayId: todayId });
      return result;
    });

    setSisterCycleDone(false);
    setSisterPlayAnimation(n=>n + 1);
    setPeriodFeelVisible(true);
    setPeriodFeelReady(false);
    setActiveTab('note');
    scrollToSisterAnalysis();
  };

  const handleSisterCycleComplete = React.useCallback(()=>{
    setSisterCycleDone(true);
    setPeriodFeelReady(true);
    requestAnimationFrame(()=>{
      setTimeout(()=>scrollTimelineToLastItem('smooth'), 120);
    });
  }, []);

  React.useEffect(()=>{
    if(activeTab !== 'note' || recordLifeMode !== '经期') return;
    const hasPeriodFeedback = timeline.some(block=>(block.items || block.entries || []).some(item=>item.analysisKind === 'period-start' || item.kind === 'sync-card' && item.periodSummaryLabel === '月经来了'));
    if(!hasPeriodFeedback || !sisterCycleDone || periodFeelRecorded) return;
    const timer = setTimeout(()=>{
      setPeriodFeelVisible(true);
      setPeriodFeelReady(true);
      setPeriodFeelGuideVisible(true);
      requestAnimationFrame(()=>setTimeout(()=>scrollTimelineToLastItem('auto'), 100));
    }, 500);
    return ()=>clearTimeout(timer);
  }, [activeTab, recordLifeMode, timeline, sisterCycleDone, periodFeelRecorded]);

  useEffect(()=>{
    if(sisterPlayAnimation > 0){
      setSisterCycleDone(false);
      setHideTodayGuide(false);
    }
  }, [sisterPlayAnimation]);

  const scrollTimelineToLastItem = (behavior='smooth')=>{
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        const el = streamRef.current;
        if(!el) return;
        const reserve = el.classList.contains('has-baby-discover')
          ? 220
          : el.classList.contains('has-dock-quick-strip')
            ? 176
            : 28;
        const anchor = el.querySelector('.tl-rail-node.is-feed-last') || timelineEndRef.current;
        if(anchor){
          const top = anchor.getBoundingClientRect().bottom - el.getBoundingClientRect().top + el.scrollTop - (el.clientHeight - reserve);
          if(behavior === 'auto') el.scrollTop = Math.max(0, top);
          else el.scrollTo({ top: Math.max(0, top), behavior });
          return;
        }
        if(behavior === 'auto') el.scrollTop = el.scrollHeight;
        else el.scrollTo({ top: el.scrollHeight, behavior });
      }, 80);
    });
  };

  const scrollTimelineToBottom = (behavior='auto')=>{
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const el = streamRef.current;
        if(!el) return;
        const top = Math.max(0, el.scrollHeight - el.clientHeight);
        if(behavior === 'auto') el.scrollTop = top;
        else el.scrollTo({ top, behavior });
      });
    });
  };

  const scrollFocusedEntryToCenter = (entryId, behavior='smooth')=>{
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const stream = streamRef.current;
        if(!stream || !entryId) return;
        const target = stream.querySelector('[data-entry-id="'+entryId+'"]');
        if(!target) return;
        const streamRect = stream.getBoundingClientRect();
        const phone = stream.closest('.phone');
        const dock = phone?.querySelector('.dock-wrap');
        const dockRect = dock?.getBoundingClientRect();
        const visibleTop = streamRect.top + 10;
        const visibleBottom = dockRect
          ? Math.min(streamRect.bottom, dockRect.top - 12)
          : streamRect.bottom - 12;
        const visualCenter = visibleTop + Math.max(0, visibleBottom - visibleTop) * 0.46;
        const targetRect = target.getBoundingClientRect();
        const targetCenter = targetRect.top + Math.min(targetRect.height, 220) / 2;
        const nextTop = Math.max(0, Math.min(
          stream.scrollHeight - stream.clientHeight,
          stream.scrollTop + targetCenter - visualCenter,
        ));
        if(behavior === 'auto') stream.scrollTop = nextTop;
        else stream.scrollTo({top:nextTop, behavior});
      });
    });
  };

  useEffect(()=>{
    window.scrollTimelineToBottom = scrollTimelineToBottom;
    return ()=>{ delete window.scrollTimelineToBottom; };
  });

  useEffect(()=>{
    window.scrollFocusedEntryToCenter = scrollFocusedEntryToCenter;
    return ()=>{ delete window.scrollFocusedEntryToCenter; };
  });

  const scrollTimelineToEnd = (behavior='smooth')=>{
    if(voiceTranscribe) scrollTimelineToBottom(behavior === 'smooth' ? 'smooth' : 'auto');
    else scrollTimelineToLastItem(behavior);
  };

  const buildPeriodDetailEntry = (details)=>{
    const detailItems = [
      details.flow ? { label:'流量', value: details.flow, icon:'flow' } : null,
      details.color ? { label:'颜色', value: details.color, icon:'color' } : null,
      details.cramps ? { label:'痛经', value: details.cramps, icon:'cramps' } : null,
    ].filter(Boolean);
    if(!detailItems.length) return null;
    return {
      kind:'record-group',
      id:'e-period-detail-'+Date.now(),
      isNew:true,
      primary:{
        id:'e-period-detail-primary-'+Date.now(),
        time: window.formatNowTime(),
        kind:'period-detail',
        text:'',
        periodDetailItems: detailItems,
        tags: detailItems.map((it)=>({ label:it.label, cat:'period', val:it.value, icon:it.icon })),
      },
    };
  };

  const buildHealthRecordEntry = (record)=>{
    if(!record?.type || !record?.label || !record?.value) return null;
    const now = Date.now();
    const iconMap = {
      love: 'love',
      discharge: 'discharge',
      temp: 'temp',
      stool: 'stool',
      habit: 'habit',
    };
    const valueText = record.detail || record.value;
    return {
      kind:'record-group',
      id:'e-health-'+record.type+'-'+now,
      isNew:true,
      primary:{
        id:'e-health-primary-'+record.type+'-'+now,
        time: window.formatNowTime(),
        kind:'daily-record',
        recordType: record.type,
        recordLabel: record.label,
        recordValue: record.value,
        recordDetail: valueText,
        icon: iconMap[record.type] || 'quick',
        iconText: record.iconText || '',
        text: `${record.label}：${valueText}`,
        tags:[{ label:record.label, cat:record.label, val:record.value, icon:iconMap[record.type] || 'quick' }],
      },
    };
  };

  const submitHealthRecordDraftsToTimeline = ()=>{
    if(!healthRecordDrafts.length) return false;
    const entries = healthRecordDrafts.map(buildHealthRecordEntry).filter(Boolean);
    if(!entries.length) return false;
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>entries.reduce(
      (nextBlocks, entry)=>window.appendTimelineEntry(nextBlocks, entry, { dayId }),
      blocks
    ));
    setHealthRecordDrafts([]);
    requestAnimationFrame(()=>setTimeout(()=>scrollTimelineToLastItem('smooth'), 160));
    return true;
  };

  const submitPeriodDetailDraftToTimeline = ()=>{
    const entry = buildPeriodDetailEntry(periodDetailDraft);
    if(!entry) return false;
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
    setPeriodDetailDraft({});
    requestAnimationFrame(()=>setTimeout(()=>scrollTimelineToLastItem('smooth'), 160));
    return true;
  };

  React.useEffect(()=>{
    const removeTimelineEntry = (entryId)=>{
      if(!entryId) return;
      setTimeline(blocks=>blocks.map(block=>{
        if(block.type !== 'day') return block;
        const items = (block.items || block.entries || []).filter(item=>{
          const primaryId = item?.primary?.id;
          return item?.id !== entryId && primaryId !== entryId;
        });
        return { ...block, items, entries: undefined };
      }));
      window.__showEditToast && window.__showEditToast('记录已删除');
    };
    window.deleteTimelineEntry = removeTimelineEntry;
    const onEditDelete = (event)=>{
      removeTimelineEntry(event?.detail?.entryId);
    };
    const onEditSave = (event)=>{
      const entryId = event?.detail?.entryId;
      const payload = event?.detail?.payload;
      if(!entryId || !payload?.kind) return;
      if(payload.kind === 'daily-record'){
        const iconMap = {
          love: 'love',
          mood: 'mood',
          discharge: 'discharge',
          temp: 'temp',
          stool: 'stool',
          habit: 'habit',
          weight: 'weight',
          diet: 'diet',
          beverage: 'beverage',
          skin: 'skin',
          cosmetic: 'cosmetic',
          photo: 'photo',
        };
        const normalizeDietItems = (payload)=>{
          const items = Array.isArray(payload.dietItems) ? payload.dietItems : [];
          if(items.length){
            return items.map((food, index)=>({
              ...food,
              id: food.id || `food-${index + 1}`,
              name: food.name || food.title || '食物',
              kcal: Number(food.kcal) || 0,
            }));
          }
          return String(payload.recordDetail || payload.recordValue || '')
            .split(/[、,，]/)
            .map(name=>name.trim())
            .filter(Boolean)
            .map((name, index)=>({ id:`food-${index + 1}`, name, amount:'', kcal:0 }));
        };
        setTimeline(blocks=>{
          let editedItem = null;
          let sourceDayId = null;
          const updatedBlocks = blocks.map(block=>{
            if(block.type !== 'day') return block;
            const nextItems = (block.items || block.entries || []).map(item=>{
            const primaryId = item?.primary?.id;
            if(item?.id !== entryId && primaryId !== entryId) return item;
            sourceDayId = block.id;
            const type = payload.recordType || item.primary?.recordType;
            const label = payload.recordLabel || item.primary?.recordLabel || '记录';
            const value = payload.recordValue || item.primary?.recordValue || '';
            const detail = payload.recordDetail || value;
            const icon = payload.icon || iconMap[type] || item.primary?.icon || 'quick';
            if(type === 'diet' && (item.kind === 'diet-photo-feedback' || item.kind === 'diet-text-feedback')){
              const dietItems = normalizeDietItems(payload);
              const foods = dietItems.map(food=>food.name).filter(Boolean);
              const totalKcal = Number(payload.totalKcal) || dietItems.reduce((sum, food)=>sum + (Number(food.kcal) || 0), 0);
              return {
                ...item,
                time: payload.time || item.time,
                sourceText: item.kind === 'diet-text-feedback' ? (detail || value || item.sourceText) : item.sourceText,
                leadingLabel: item.kind === 'diet-text-feedback' ? '饮食：' : item.leadingLabel,
                dietData:{
                  ...(item.dietData || {}),
                  time: payload.time || item.dietData?.time || item.time,
                  items: dietItems,
                  foods,
                  totalKcal,
                  mealType: payload.mealType || item.dietData?.mealType || '',
                  matchStatus: item.dietData?.matchStatus || 'all',
                },
              };
            }
            if(type === 'diet' && item.kind === 'record-group' && item.primary?.kind === 'image'){
              const dietItems = normalizeDietItems(payload);
              const totalKcal = Number(payload.totalKcal) || dietItems.reduce((sum, food)=>sum + (Number(food.kcal) || 0), 0);
              return {
                ...item,
                primary:{
                  ...item.primary,
                  time:payload.time || item.primary.time,
                  label:payload.mealType || item.primary.label || '午餐',
                  mealType:payload.mealType || item.primary.mealType || '',
                  dietItems,
                  text:dietItems.map(food=>`${food.name}${food.amount ? ` ${food.amount}` : ''}`).join('；'),
                  totalKcal,
                },
              };
            }
            if(!item.primary) return item;
            const nextPrimary = {
              ...item.primary,
              time: payload.time || item.primary?.time,
              kind:'daily-record',
              recordType:type,
              recordLabel:label,
              recordValue:value,
              recordDetail:detail,
              icon,
              iconText: payload.iconText || item.primary?.iconText || '',
              brand:payload.brand ?? item.primary?.brand,
              beverageName:payload.beverageName ?? item.primary?.beverageName,
              beverageCategory:payload.beverageCategory ?? item.primary?.beverageCategory,
              capacityMl:payload.capacityMl ?? item.primary?.capacityMl,
              iceLevel:payload.iceLevel ?? item.primary?.iceLevel,
              sugarLevel:payload.sugarLevel ?? item.primary?.sugarLevel,
              spec:payload.spec ?? item.primary?.spec,
              calories:payload.calories ?? item.primary?.calories,
              caffeineMg:payload.caffeineMg ?? item.primary?.caffeineMg,
              area:payload.area ?? item.primary?.area,
              acne:payload.acne ?? item.primary?.acne,
              redness:payload.redness ?? item.primary?.redness,
              acneMarks:payload.acneMarks ?? item.primary?.acneMarks,
              product:payload.product ?? item.primary?.product,
              managementStatus:payload.managementStatus ?? item.primary?.managementStatus,
              note:payload.note ?? item.primary?.note,
              dayLabel:payload.dayLabel ?? item.primary?.dayLabel,
              text:`${label}：${detail}`,
              tags:[{ label, cat:label, val:value, icon }],
            };
            const nextCapacity = Number(payload.capacityMl ?? item.primary?.capacityMl) || 0;
            const nextAi = type === 'beverage' ? {
              ...item.ai,
              title:'今日饮水进度',
              chartType:'dailyGoal',
              chartData:{
                kind:'water',
                consumed:Math.min(1500, 550 + nextCapacity),
                goal:1500,
                unit:'ml',
              },
              note:'',
            } : item.ai;
            editedItem = {
              ...item,
              primary:nextPrimary,
              ai:nextAi,
            };
            return editedItem;
          });
          return { ...block, items: nextItems, entries: undefined };
          });
          if(!editedItem || !sourceDayId || !payload.dayLabel) return updatedBlocks;
          const targetDayId = window.resolveEntryDayId(payload.dayLabel, updatedBlocks);
          if(!targetDayId || targetDayId === sourceDayId) return updatedBlocks;
          const withoutEditedItem = updatedBlocks.map(block=>{
            if(block.type !== 'day' || block.id !== sourceDayId) return block;
            return {
              ...block,
              items:(block.items || []).filter(item=>item?.id !== entryId && item?.primary?.id !== entryId),
              entries:undefined,
            };
          });
          return window.appendTimelineEntry(withoutEditedItem, editedItem, { dayId:targetDayId });
        });
        return;
      }
      if(payload.kind === 'quick'){
        const detailItems = (payload.detailItems || payload.periodDetails || []).filter(it=>it?.label && it?.value);
        const recordLabel = payload.recordLabel || '快捷记录';
        const recordIcon = payload.icon || (recordLabel.indexOf('走') >= 0 ? 'period-end' : 'period');
        const isSymptomQuick = recordIcon === 'symptom' || recordLabel === '症状';
        setTimeline(blocks=>blocks.map(block=>{
          if(block.type !== 'day') return block;
          const nextItems = (block.items || block.entries || []).map(item=>{
            const primaryId = item?.primary?.id;
            if(item?.id !== entryId && primaryId !== entryId) return item;
            if(item?.primary){
              if(isSymptomQuick){
                const symptomValue = payload.recordValue || detailItems.map(it=>it.value).filter(Boolean).join('、');
                return {
                  ...item,
                  primary:{
                    ...item.primary,
                    time: payload.time || item.primary?.time,
                    kind:'symptom',
                    text:'',
                    symptomLabel: recordLabel,
                    symptomValue,
                    tags:[],
                  },
                };
              }
              return {
                ...item,
                primary:{
                  ...item.primary,
                  time: payload.time || item.primary?.time,
                  periodLabel: recordLabel,
                  text: recordLabel,
                  tags:[{ label: recordLabel, cat:'period', val:'', icon: recordIcon }],
                },
              };
            }
            if(isSymptomQuick){
              const symptomValue = payload.recordValue || detailItems.map(it=>it.value).filter(Boolean).join('、');
              return {
                ...item,
                time: payload.time || item.time,
                kind:'symptom',
                body:'',
                symptomLabel: recordLabel,
                symptomValue,
                tags:[],
              };
            }
            return {
              ...item,
              time: payload.time || item.time,
              body: recordLabel,
              tags:[{ label: recordLabel, cat:'period', val:'', icon: recordIcon }],
              periodDetails: detailItems,
              periodSummaryLabel: recordLabel,
            };
          });
          return { ...block, items: nextItems, entries: undefined };
        }));
        return;
      }
      if(payload.kind !== 'period-detail') return;
      const detailItems = (payload.periodDetailItems || []).filter(it=>it?.label && it?.value);
      setTimeline(blocks=>blocks.map(block=>{
        if(block.type !== 'day') return block;
        const nextItems = (block.items || []).map(item=>{
          const primaryId = item?.primary?.id;
          if(item?.id !== entryId && primaryId !== entryId) return item;
          return {
            ...item,
            primary:{
              ...item.primary,
              time: payload.time || item.primary?.time,
              periodDetailItems: detailItems,
              tags: detailItems.map((it)=>({ label:it.label, cat:'period', val:it.value, icon:it.icon })),
            },
          };
        });
        return { ...block, items: nextItems, entries: undefined };
      }));
    };
    window.addEventListener('edit-save', onEditSave);
    window.addEventListener('edit-delete', onEditDelete);
    return ()=>{
      window.removeEventListener('edit-save', onEditSave);
      window.removeEventListener('edit-delete', onEditDelete);
      delete window.deleteTimelineEntry;
    };
  }, []);

  const handleTabChange = (tab)=>{
    setReviewCycleOpenRequest(0);
    setReviewCycleReturnTab(null);
    if(tab === 'note' && activeTab !== 'note'){
      recordEnterModeRef.current = 'manual';
      if(periodDetailRecordEnabled || periodEndRecordCompleted) submitPeriodDetailDraftToTimeline();
      submitHealthRecordDraftsToTimeline();
      setNoteTabUnread(false);
      clearTimeout(babyVoiceSuccessTimerRef.current);
      setBabyVoiceSuccess({show:false});
    }
    if(tab !== 'note'){
      recordEnterModeRef.current = 'idle';
      setBabyFeedingEntryActive(false);
    }
    if(tab === 'cal' && activeTab !== 'cal' && periodEndRecordCompleted){
      setPeriodDetailDraft({});
    }
    setActiveTab(tab);
  };

  const handleFeedingRecordEntry = ()=>{
    if(recordLifeMode !== '育儿') return;
    setBabyFeedingEntryActive(true);
    setBabyDiscoverVisible(false);
    setNoteTabUnread(false);
    recordEnterModeRef.current = 'feeding-entry';
    setActiveTab('note');
  };

  const handleEmptyPreviewEnter = React.useCallback((mode) => {
    setEmptyPreviewGuideStep(0);
    const withData = mode === 'with-data';
    setEmptyPreviewMode(withData ? 'with-data' : 'no-data');
    const blocks = withData
      ? (window.getEmptyPreviewWithDataTimeline?.() || [])
      : (window.getTimelineEmpty?.(ctx) || []);
    setTimeline(blocks);
    setDraft('');
    setShowSearchPage(false);
    setSearchCriteria(null);
    setDockExpanded(false);
    setHideTodayGuide(true);
    recordEnterModeRef.current = 'manual';
    setActiveTab('note');
  }, [ctx]);

  const showRecordEmpty = !!(noteScene.record.emptyState && window.isTimelineEmpty(timeline));
  const showRecordBlank = !!noteScene.record.blankState;
  const showBlankEmpty = showRecordBlank && window.isTimelineEmpty(timeline);

  useEffect(()=>{
    if(activeTab !== 'note') return;
    if(showRecordEmpty || showBlankEmpty) return;
    if(voiceTranscribe){
      const tm = setTimeout(()=>scrollTimelineToBottom('auto'), 80);
      return ()=>clearTimeout(tm);
    }
    if(recordLifeMode === '育儿' && babyFeedingEntryActive){
      const tm = setTimeout(()=>scrollTimelineToLastItem('auto'), 0);
      recordEnterModeRef.current = 'idle';
      return ()=>clearTimeout(tm);
    }
    if(recordLifeMode === '育儿' && babyDiscoverVisible && !babyFeedingEntryActive){
      const tm = setTimeout(()=>scrollTimelineToLastItem('auto'), 0);
      recordEnterModeRef.current = 'idle';
      return ()=>clearTimeout(tm);
    }
    if(recordEnterModeRef.current === 'analysis'){
      recordEnterModeRef.current = 'idle';
      return;
    }
    const tm = setTimeout(()=>scrollTimelineToLastItem('smooth'), 220);
    recordEnterModeRef.current = 'idle';
    return ()=>clearTimeout(tm);
  }, [activeTab, showRecordEmpty, showBlankEmpty, voiceTranscribe, recordLifeMode, babyDiscoverVisible, babyFeedingEntryActive]);

  useEffect(()=>{
    if(showRecordEmpty || showBlankEmpty) return;
    if(voiceTranscribe){
      const t1 = setTimeout(()=>scrollTimelineToBottom('auto'), 50);
      const t2 = setTimeout(()=>scrollTimelineToBottom('auto'), 240);
      return ()=>{ clearTimeout(t1); clearTimeout(t2); };
    }
    const tm = setTimeout(()=>scrollTimelineToEnd('auto'), 120);
    return ()=>clearTimeout(tm);
  }, [t.demoScene, showRecordEmpty, showBlankEmpty, voiceTranscribe]);

  useEffect(()=>{
    if(showRecordEmpty || showBlankEmpty) return;
    if(voiceTranscribe) return;
    if(focusedInputPathsDemo) return;
    scrollTimelineToEnd('smooth');
  }, [timeline, showRecordEmpty, showBlankEmpty, voiceTranscribe, focusedInputPathsDemo]);

  const pushToast = (opts)=>{
    const id = Math.random().toString(36).slice(2);
    setToasts(ts=>[...ts, {id, ...opts}]);
    setTimeout(()=>{
      setToasts(ts=>ts.map(x=>x.id===id?{...x,bye:true}:x));
      setTimeout(()=>setToasts(ts=>ts.filter(x=>x.id!==id)), 220);
    }, opts.duration || 2400);
  };

  const handleRecordModeChange = (mode)=>{
    setRecordLifeMode(mode);
    if(mode === '育儿'){
      pushToast({text:'已切换至育儿模式', placement:'center'});
    } else if(mode === '经期'){
      pushToast({text:'已切换至经期模式', placement:'center'});
    }
  };

  const stopBabyVoiceTyping = ()=>{
    if(babyVoiceTimerRef.current){
      clearInterval(babyVoiceTimerRef.current);
      babyVoiceTimerRef.current = null;
    }
  };

  const activateBabyVoiceHold = ()=>{
    setBabyVoiceCoachHidden(true);
    babyVoiceActiveRef.current = true;
    stopBabyVoiceTyping();
    clearTimeout(babyVoiceSuccessTimerRef.current);
    setBabyVoiceSuccess({show:false});
    setBabyVoiceSession({active:true, cancel:false, textLength:0});
    babyVoiceTimerRef.current = setInterval(()=>{
      setBabyVoiceSession((current)=>{
        if(!current.active){
          stopBabyVoiceTyping();
          return current;
        }
        if(current.textLength >= BABY_VOICE_DEMO_TEXT.length){
          stopBabyVoiceTyping();
          return current;
        }
        return {...current, textLength: current.textLength + 1};
      });
    }, 62);
  };

  const startBabyVoiceHold = (clientY)=>{
    if(recordLifeMode !== '育儿') return;
    babyVoiceStartYRef.current = clientY || 0;
    babyVoiceActiveRef.current = false;
    babyVoiceCancelRef.current = false;
    stopBabyVoiceTyping();
    clearTimeout(babyVoiceHoldTimerRef.current);
    babyVoiceHoldTimerRef.current = setTimeout(()=>{
      babyVoiceHoldTimerRef.current = null;
      activateBabyVoiceHold();
    }, 300);
  };

  const moveBabyVoiceHold = (clientY)=>{
    const shouldCancel = (babyVoiceStartYRef.current - (clientY || 0)) > 64;
    babyVoiceCancelRef.current = shouldCancel;
    setBabyVoiceSession((current)=>{
      if(!current.active) return current;
      return current.cancel === shouldCancel ? current : {...current, cancel: shouldCancel};
    });
  };

  const babyFeedingStatColors = {
    母乳:'#ff5b91',
    配方奶:'#ff6f91',
    瓶喂母乳:'#ff8eb8',
    换尿布:'#f5a400',
    睡眠:'#a56cf4',
    营养补剂:'#3CB88C',
    喝水:'#5B8DEF',
    吸奶:'#7BC7D8',
    辅食:'#F2A65A',
    洗澡:'#5FCAD1',
    玩耍:'#F4B45F',
    游泳:'#4AA9E9',
    心情:'#9B6BE8',
    体重:'#9B6BE8',
    饮食:'#F2A65A',
    体温:'#9B6BE8',
    症状:'#9B6BE8',
  };

  const formatBabyFeedingDuration = (minutes)=>{
    if(!minutes) return '';
    if(minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h${mins}min` : `${hours}h`;
  };

  const formatBabyFeedingDurationText = (minutes)=>{
    if(!minutes) return '';
    if(minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const addMinutesToBabyTime = (timeText, minutes)=>{
    const match = String(timeText || '').match(/^(\d{1,2}):(\d{2})$/);
    if(!match) return timeText || '';
    const start = Number(match[1]) * 60 + Number(match[2]);
    const next = (start + minutes + 24 * 60) % (24 * 60);
    return `${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`;
  };

  const buildBabyFeedingDetailLines = (item, time)=>{
    if(item.label === '母乳'){
      const left = item.leftMinutes || 10;
      const right = item.rightMinutes || 10;
      const total = left + right;
      return [
        `母乳：左${left}分钟，右${right}分钟`,
        `${time}-${addMinutesToBabyTime(time, total)}`,
      ];
    }
    if(item.label === '睡眠'){
      const duration = item.durationMinutes || 292;
      return [
        `睡眠：睡了${formatBabyFeedingDurationText(duration)}`,
        `${time}-${addMinutesToBabyTime(time, duration)}`,
      ];
    }
    if(['洗澡', '玩耍', '游泳'].includes(item.label)){
      const duration = item.durationMinutes || Number.parseInt(item.value, 10) || 0;
      return [
        `${item.label}：${formatBabyFeedingDurationText(duration)}`,
        `${time}-${addMinutesToBabyTime(time, duration)}`,
      ];
    }
    return null;
  };

  const readBabyFeedingMeasure = (item)=>{
    if(item.statDurationMinutes) return {kind:'duration', value:item.statDurationMinutes, unit:'min'};
    const source = [item.value, item.text].filter(Boolean).join(' ');
    const mlMatch = source.match(/(\d+(?:\.\d+)?)\s*(?:ml|毫升)/i);
    if(mlMatch) return {kind:'volume', value:Number(mlMatch[1]), unit:'ml'};
    const hourMatch = source.match(/(\d+(?:\.\d+)?)\s*(?:小时|h)(?:(\d+(?:\.\d+)?)\s*(?:分钟|min))?/i);
    if(hourMatch){
      const hours = Number(hourMatch[1]) * 60;
      const mins = hourMatch[2] ? Number(hourMatch[2]) : 0;
      return {kind:'duration', value:Math.round(hours + mins), unit:'min'};
    }
    const minuteMatches = [...source.matchAll(/(\d+(?:\.\d+)?)\s*(?:分钟|min)/gi)];
    if(minuteMatches.length){
      const total = minuteMatches.reduce((sum, match)=>sum + Number(match[1]), 0);
      return {kind:'duration', value:Math.round(total), unit:'min'};
    }
    return null;
  };

  const buildBabyFeedingDailySummary = (items=[])=>{
    const order = BABY_FEEDING_QUICK_ITEMS.map(item=>item.label);
    const stats = new Map();
    (items || []).forEach((item)=>{
      if(item.kind !== 'baby-feeding-card') return;
      const label = item.feedType || String(item.text || '').split('：')[0] || '其他事件';
      const current = stats.get(label) || {
        label,
        count:0,
        volume:0,
        duration:0,
        color:item.color || babyFeedingStatColors[label] || '#ff6f91',
      };
      current.count += 1;
      const measure = readBabyFeedingMeasure(item);
      if(measure?.kind === 'volume') current.volume += measure.value;
      if(measure?.kind === 'duration') current.duration += measure.value;
      stats.set(label, current);
    });
    const sorted = [...stats.values()].sort((a, b)=>{
      const ai = order.indexOf(a.label);
      const bi = order.indexOf(b.label);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return {
      title:'今日喂养小计',
      items:sorted.map((row)=>({
        label:row.label,
        value:[
          `${row.count}次`,
          row.volume ? `${Math.round(row.volume)}ml` : '',
          row.duration ? formatBabyFeedingDuration(row.duration) : '',
        ].filter(Boolean).join(' '),
        color:row.color,
        wide:row.label === '母乳',
      })),
    };
  };

  const clearBabyFeedingLatestMarks = (blocks)=>blocks.map(block=>{
    if(block.type !== 'day') return block;
    const items = (block.items || block.entries || []).map(item=>{
      if(item.kind !== 'baby-feeding-card' || (!item.summary && !item.relativeTime)) return item;
      const next = {...item};
      delete next.summary;
      delete next.relativeTime;
      return next;
    });
    return {...block, items, entries:undefined};
  });

  const refreshBabyFeedingLatestMarks = (blocks, targetDayId)=>{
    const cleaned = clearBabyFeedingLatestMarks(blocks);
    let latestDayId = targetDayId;
    if(!latestDayId){
      for(let i = cleaned.length - 1; i >= 0; i -= 1){
        const block = cleaned[i];
        if(block.type !== 'day') continue;
        if(block.relativeLabel === '昨天') continue;
        const items = block.items || block.entries || [];
        if(items.some(item=>item.kind === 'baby-feeding-card')){
          latestDayId = block.id;
          break;
        }
      }
    }
    return cleaned.map(block=>{
      if(block.type !== 'day' || block.id !== latestDayId) return block;
      const items = block.items || block.entries || [];
      const latestIndex = items.reduce((found, item, index)=>(
        item.kind === 'baby-feeding-card' ? index : found
      ), -1);
      if(latestIndex < 0) return {...block, items, entries:undefined};
      const summary = buildBabyFeedingDailySummary(items);
      return {
        ...block,
        items:items.map((item, index)=>index === latestIndex ? {
          ...item,
          relativeTime:formatBabyFeedingRelativeTime(item.time),
          summary,
        } : item),
        entries:undefined,
      };
    });
  };

  const resolveBabyFeedingTargetDayId = (blocks)=>{
    const days = (blocks || []).filter(block=>block.type === 'day');
    for(let i = days.length - 1; i >= 0; i -= 1){
      if(days[i].relativeLabel === '昨天') continue;
      const items = days[i].items || days[i].entries || [];
      if(items.some(item=>item.kind === 'baby-feeding-card')) return days[i].id;
    }
    return days.find(day=>day.isToday)?.id;
  };

  const formatBabyFeedingRelativeTime = (timeText)=>{
    const match = String(timeText || '').match(/^(\d{1,2}):(\d{2})$/);
    if(!match) return '刚刚';
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const recordMinutes = Number(match[1]) * 60 + Number(match[2]);
    let diff = nowMinutes - recordMinutes;
    if(diff < 0) diff += 24 * 60;
    if(diff < 1) return '刚刚';
    if(diff < 60) return diff + '分钟前';
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return minutes ? `${hours}小时${minutes}分钟前` : `${hours}小时前`;
  };

  const appendBabyFeedingTimelineCard = ()=>{
    if(babyFeedingCardInsertedRef.current) return;
    babyFeedingCardInsertedRef.current = true;
    const sourceQuote = '昨晚3点喝了100ml奶，然后换了1片尿布，早上7点又喝了120ml奶';
    const sourceGroupId = 'baby-feeding-source-'+Date.now();
    const sourceGroupHint = '来自语音「昨晚3点喝100ml奶...」· 共3条';
    const entries = [
      {
        id:'baby-feeding-batch-formula-night-'+Date.now(),
        kind:'baby-feeding-card',
        time:'03:00',
        text:'配方奶：100ml',
        feedType:'配方奶',
        value:'100ml',
        icon:'🍼',
        color:'#FF7A66',
        sourceGroupId,
        sourceGroupHint,
        railDot:'baby',
        isNew:true,
      },
      {
        id:'baby-feeding-batch-diaper-'+Date.now(),
        kind:'baby-feeding-card',
        time:'03:05',
        text:'换尿布：1片',
        feedType:'换尿布',
        value:'1片',
        icon:'🧷',
        color:'#E8A23D',
        sourceGroupId,
        sourceGroupHint,
        railDot:'baby',
        isNew:true,
      },
      {
        id:'baby-feeding-batch-formula-morning-'+Date.now(),
        kind:'baby-feeding-card',
        time:'07:00',
        text:'配方奶：120ml',
        voice:{duration:'8″'},
        feedType:'配方奶',
        value:'120ml',
        icon:'🍼',
        color:'#FF7A66',
        voiceQuote:sourceQuote,
        sourceGroupId,
        sourceGroupRole:'anchor',
        sourceGroupCount:3,
        railDot:'baby',
        isNew:true,
      },
    ];
    setTimeline(blocks=>{
      const cleaned = clearBabyFeedingLatestMarks(blocks);
      const yesterdayDayId = cleaned.find(block=>block.type === 'day' && block.relativeLabel === '昨天')?.id;
      const todayDayId = cleaned.find(block=>block.type === 'day' && block.isToday)?.id
        || resolveBabyFeedingTargetDayId(cleaned);
      let next = cleaned;
      next = window.appendTimelineEntry(next, entries[0], {dayId:yesterdayDayId || todayDayId});
      next = window.appendTimelineEntry(next, entries[1], {dayId:yesterdayDayId || todayDayId});
      next = window.appendTimelineEntry(next, entries[2], {dayId:todayDayId});
      return refreshBabyFeedingLatestMarks(next, todayDayId);
    });
  };

  const handleBabyFeedingQuickSelect = (item)=>{
    if(!item) return;
    const now = Date.now();
    const lastQuick = babyFeedingQuickGuardRef.current;
    if(lastQuick.id === item.id && now - lastQuick.at < 500) return;
    babyFeedingQuickGuardRef.current = {id:item.id, at:now};
    setBabyDiscoverVisible(false);
    setNoteTabUnread(false);
    const time = window.formatNowTime?.() || '08:15';
    const entry = {
      id:'baby-feeding-quick-'+item.id+'-'+Date.now(),
      kind:'baby-feeding-card',
      time,
      text:item.text || `${item.label}：${item.value || '已记录'}`,
      feedType:item.label,
      value:item.value,
      detailLines:buildBabyFeedingDetailLines(item, time),
      statDurationMinutes:item.durationMinutes || ((item.leftMinutes || 0) + (item.rightMinutes || 0)) || undefined,
      icon:item.cardIcon || '🍼',
      iconSrc:item.iconSrc,
      color:item.color || '#FF7A66',
      voiceQuote:item.voiceQuote,
      railDot:'baby',
      isNew:true,
    };
    setTimeline(blocks=>{
      const dayId = resolveBabyFeedingTargetDayId(blocks);
      const next = window.appendTimelineEntry(clearBabyFeedingLatestMarks(blocks), entry, {dayId});
      return refreshBabyFeedingLatestMarks(next, dayId);
    });
    setTimeout(()=>scrollTimelineToBottom('smooth'), 80);
  };

  const handlePeriodDockQuickSelect = (item)=>{
    if(!item) return;
    submitQuickMark({
      text:item.text || item.label,
      label:item.label,
      emoji:item.icon || '✓',
    });
    setTimeout(()=>scrollTimelineToBottom('smooth'), 80);
  };

  React.useEffect(()=>{
    setTimeline(blocks=>refreshBabyFeedingLatestMarks(blocks));
  }, []);

  const closeBabyFeedingDiscoverCard = ()=>{
    setBabyDiscoverVisible(false);
    setTimeout(()=>scrollTimelineToBottom('smooth'), 60);
  };

  const submitBabyFeedingVoice = ()=>{
    setBabyDiscoverVisible(false);
    clearTimeout(babyVoiceSuccessTimerRef.current);
    setBabyVoiceSuccess({show:false});
    setNoteTabUnread(false);
    appendBabyFeedingTimelineCard();
    setTimeout(()=>scrollTimelineToBottom('smooth'), 120);
  };

  const endBabyVoiceHold = ()=>{
    if(babyVoiceHoldTimerRef.current){
      clearTimeout(babyVoiceHoldTimerRef.current);
      babyVoiceHoldTimerRef.current = null;
      babyVoiceCancelRef.current = false;
      // 短按点滴 tab：进入点滴并清除记录成功提示与小红点
      setNoteTabUnread(false);
      clearTimeout(babyVoiceSuccessTimerRef.current);
      setBabyVoiceSuccess({show:false});
      setActiveTab('note');
      return;
    }
    if(!babyVoiceActiveRef.current) return;
    const cancelled = babyVoiceCancelRef.current;
    babyVoiceActiveRef.current = false;
    babyVoiceCancelRef.current = false;
    setBabyVoiceSession((current)=>({...current, active:false, cancel:false}));
    stopBabyVoiceTyping();
    if(!cancelled){
      setBabyDiscoverVisible(false);
      appendBabyFeedingTimelineCard();
      setBabyVoiceSuccess({show:true});
      if(activeTab !== 'note') setNoteTabUnread(true);
      // 提示保持展示，直到用户点击进入点滴 tab 时一并消失
      clearTimeout(babyVoiceSuccessTimerRef.current);
    }
  };

  React.useEffect(()=>()=>{
    clearTimeout(babyVoiceHoldTimerRef.current);
    stopBabyVoiceTyping();
    clearTimeout(babyVoiceSuccessTimerRef.current);
  }, []);

  const markUserRecorded = ()=>{
    if(scene.record.todayGuide) setHideTodayGuide(true);
  };

  const isScheme3 = noteScene.record.blankScheme === 3;
  const isScheme1 = noteScene.record.blankScheme === 1;
  const showScheme1Hints = isScheme1 && showBlankEmpty && !emptyPreviewMode;
  if(isScheme3 && scheme3FirstVisitRef.current === null){
    scheme3FirstVisitRef.current = !!window.shouldShowScheme3Bubble?.();
  }

  const pushToTimeline = (entry, text)=>{
    const dayId = window.resolveEntryDayId(text || entry.body || '', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
  };

  const revealFirstDropEntry = React.useCallback(()=>{
    if(dropLandRevealRef.current) return;
    dropLandRevealRef.current = true;
    setTimeline(blocks=>blocks.map(b=>{
      if(b.type !== 'day') return b;
      const items = (b.items || b.entries || []).map(it=>{
        if(it.id !== firstDropAnim?.entryId) return it;
        const next = { ...it };
        delete next.hideBodyUntilDrop;
        delete next.pendingDrop;
        if(it.kind === 'mood-insight' || it.kind === 'record-group' || it.kind === 'diet-photo-feedback') next.isNew = true;
        return next;
      });
      return { ...b, items, entries: undefined };
    }));
    requestAnimationFrame(()=>{
      setTimeout(()=>scrollTimelineToLastItem('smooth'), 80);
    });
  }, [firstDropAnim]);

  const handleFirstDropLand = React.useCallback(()=>{
    revealFirstDropEntry();
  }, [revealFirstDropEntry]);

  const handleFirstDropComplete = React.useCallback(()=>{
    setFirstDropAnim(null);
    dropLandRevealRef.current = false;
  }, []);

  const tryStartFirstDrop = (entry, text)=>{
    if(!recordFeedback || firstRecordAnimDoneRef.current) return false;
    firstRecordAnimDoneRef.current = true;

    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId(text || entry.body || '', timeline);

    const pending = (entry.kind === 'mood-insight' || entry.kind === 'record-group' || entry.kind === 'diet-photo-feedback')
      ? { ...entry, pendingDrop: true, isNew: false }
      : { ...entry, hideBodyUntilDrop: true, isNew: true };

    setFirstDropAnim({ entryId: pending.id });
    setTimeline(blocks=>window.appendTimelineEntry(blocks, pending, { dayId }));
    return true;
  };

  const submitText = (textOverride, opts={})=>{
    const text = (textOverride || draft).trim();
    if(!text) return;

    const recordScenario = window.readCameraPermissionScenario?.() || 'unauthorized';
    const dietEntry = window.tryCreateDietTextFeedbackEntry?.(text, recordScenario, opts.voice);
    if (dietEntry) {
      setDraft('');
      markUserRecorded();
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId('', timeline);
      setTimeline(blocks=>window.appendTimelineEntry(blocks, dietEntry, { dayId }));
      requestAnimationFrame(()=>{
        if (typeof window.scrollTimelineToBottom === 'function') {
          window.scrollTimelineToBottom('smooth');
        }
      });
      return;
    }

    const weightEntry = window.tryCreateWeightTextEntry?.(text, opts);
    if (weightEntry) {
      setDraft('');
      markUserRecorded();
      const entryText = weightEntry.primary?.text || '';
      if(recordFeedback && tryStartFirstDrop(weightEntry, entryText)) return;
      pushToTimeline(weightEntry, entryText);
      return;
    }

    const hits = window.extractKeywords(text);
    setDraft('');
    markUserRecorded();
    const entry = buildTimelineEntry(text, hits, opts);
    if(recordFeedback && tryStartFirstDrop(entry, text)) return;
    pushToTimeline(entry, text);
  };

  // ====== 清除上一轮演示卡片 ======
  const clearDemoCards = (cb)=>{
    if(!demoIdsRef.current.length){ cb?.(); return; }
    // 淡出 DOM
    demoIdsRef.current.forEach(id=>{
      const el = document.querySelector('[data-entry-id="'+id+'"]');
      if(el){ el.style.transition='opacity .2s'; el.style.opacity='0'; }
    });
    const oldIds = [...demoIdsRef.current];
    setTimeout(()=>{
      setTimeline(blocks=>blocks
        .map(b=>{
          if(b.type!=='day') return b;
          const items = (b.items||[]).filter(it=>!oldIds.includes(it.id));
          return {...b, items, entries:undefined};
        })
        .filter(b=>b.id!=='d-5-17' || (b.items||[]).length > 0) // 清空后移除空的 d-5-17
      );
      demoIdsRef.current = [];
      cb?.();
    }, 220);
  };

  // ====== 6 阶段演示流程 ======
  const runDemoFlow = ()=>{
    setIsDemoRunning(true);
    setDemoPhase('recognizing');

    const demoR1Id = 'demo-r1-'+Date.now();
    const demoR2Id = 'demo-r2-'+Date.now();
    const demoR3Id = 'demo-r3-'+Date.now();
    demoIdsRef.current = [demoR1Id, demoR2Id, demoR3Id];

    const DEMO_TEXT = '昨天下午来了姨妈，来之前，上午就开始头痛。';

    // 阶段 2：识别中 800ms → 浮层消失
    setTimeout(()=>{
      setDemoPhase(null);

      // 阶段 3：插入记录 1、2 到 5-17 block（200ms 后）
      setTimeout(()=>{
        const r1 = {
          kind:'record-group', id:demoR1Id, isNew:true, _demoCard:true,
          primary:{ id:demoR1Id, time:'10:00', kind:'text',
            kind:'symptom',
            symptomLabel:'症状',
            symptomValue:'头痛',
            text:'头痛',
            tags:[{cat:'症状', val:'头痛', icon:'sym'}],
          },
        };
        const r2 = {
          kind:'record-group', id:demoR2Id, isNew:true, _demoCard:true,
          primary:{ id:demoR2Id, time:'16:00', kind:'text',
            kind:'period',
            periodLabel:'月经来了',
            text:'月经来了',
            tags:[{cat:'月经', val:'', icon:'period'}],
          },
        };
        setTimeline(blocks=>{
          // 动态插入 d-5-17 day block（如果不存在）
          let next = blocks;
          if(!next.find(b=>b.id==='d-5-17')){
            const todayIdx = next.findIndex(b=>b.type==='day'&&b.isToday);
            const ins = { type:'day', id:'d-5-17', date:'5/17', weekday:'周日', items:[] };
            next = [...next];
            next.splice(todayIdx >= 0 ? todayIdx : next.length, 0, ins);
          }
          next = window.appendTimelineEntry(next, r1, {dayId:'d-5-17'});
          next = window.appendTimelineEntry(next, r2, {dayId:'d-5-17'});
          return next;
        });

        // 阶段 4：停留 200ms，追加记录 3 占位
        setTimeout(()=>{
          const r3 = {
            kind:'voice-card', id:demoR3Id, isNew:true, _demoCard:true,
            time:'12:00',
            body:'',
            voiceText:'',
            voice:{ duration:'0:05' },
            tagLayout:'t5',
            tags:[],
            _demoTypewriter: true,
            _demoFullText: DEMO_TEXT,
            _demoTags:[
              {cat:'月经', val:'开始', icon:'period'},
              {cat:'症状', val:'头痛', icon:'sym'},
            ],
          };
          setTimeline(blocks=>{
            const todayId = blocks.find(b=>b.type==='day'&&b.isToday)?.id;
            return window.appendTimelineEntry(blocks, r3, {dayId: todayId});
          });

          // 滚动到记录 3
          setTimeout(()=>{
            const el = document.querySelector('[data-entry-id="'+demoR3Id+'"]');
            if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
          }, 80);

          // 阶段 5 由 SegmentedRecordCard 的 TypewriterText 完成回调驱动
          // 阶段 6：回填来源标签
          // 通过 window event 监听 typewriter 完成
          const onTypewriterDone = ()=>{
            window.removeEventListener('demoTypewriterDone', onTypewriterDone);
            setTimeout(()=>{
              setIsDemoRunning(false);
            }, 900);
          };
          window.addEventListener('demoTypewriterDone', onTypewriterDone);

        }, 200); // 阶段 4 delay
      }, 200); // 阶段 3 delay after float disappears
    }, 800); // 阶段 2 ASR delay
  };

  const submitVoice = (transcript, durSec)=>{
    const recordScenario = window.readCameraPermissionScenario?.() || 'unauthorized';
    if (window.isDietTextRecordScenario?.(recordScenario)) {
      markUserRecorded();
      const text = (transcript || '').trim();
      if (text) {
        submitText(text, {
          voice: { duration: window.formatVoiceDur?.(durSec) || '0:03' },
        });
        return;
      }
    }

    markUserRecorded();
    setDemoPhase('listening');
    // 清除上一轮演示卡片，然后启动新流程
    clearDemoCards(()=> runDemoFlow());

    // 真实 ASR 接入时启用以下逻辑：
    // const text = transcript.trim();
    // if(!text) return;
    // const hits = window.extractKeywords(text);
    // const entry = buildTimelineEntry(text, hits, {
    //   voice: { duration: window.formatVoiceDur(durSec) },
    // });
    // if(recordFeedback && tryStartFirstDrop(entry, text)) return;
    // pushToTimeline(entry, text);
  };

  const submitQuickMark = (mark)=>{
    submitText(mark.text, { quickTag: { emoji: mark.emoji, label: mark.label } });
  };

  const collectTodayQuickMoodHistory = ()=>{
    const today = timeline.find(b=>b.type==='day' && b.isToday);
    if(!today) return [];
    const items = today.items || today.entries || [];
    return items
      .filter(it=>it && it.quickMood)
      .map(it=>it.quickMood);
  };

  const appendMoodGuide = (guideText, dayId)=>{
    moodGuideQueueRef.current = ()=>{
      const guide = {
        id: 'e-mood-guide-' + Date.now(),
        kind: 'guide',
        isNew: true,
        alwaysShow: true,
        text: guideText,
      };
      setTimeline(blocks=>window.appendTimelineEntry(blocks, guide, { dayId }));
      requestAnimationFrame(()=>{
        setTimeout(()=>{
          window.scrollFeedContentIntoView?.(
            document.querySelector('.tl-rail-node.is-feed-last .tl-rail-guide-text')
          );
        }, 80);
      });
    };
  };

  const appendFocusedStructuredFlow = (entry)=>{
    if(!entry) return;
    const focusedEntry = {
      ...entry,
      kind:'record-group',
      isNew:true,
      focusedStructuredFlow:true,
      staggerReveal:true,
      aiDefaultOpen:true,
    };
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, focusedEntry, { dayId }));
    setTimeout(()=>scrollFocusedEntryToCenter(focusedEntry.primary?.id || focusedEntry.id, 'smooth'), 80);
  };

  const submitMoodRecord = (moods)=>{
    markUserRecorded();
    if(focusedInputPathsDemo){
      const list = Array.isArray(moods) ? moods : [moods];
      const mood = list[0] || {label:'一般'};
      const stamp = Date.now();
      const time = window.formatNowTime?.() || '19:00';
      appendFocusedStructuredFlow({
        id:`focused-mood-${stamp}`,
        primary:{
          id:`focused-mood-${stamp}-primary`, time, kind:'daily-record',
          recordType:'mood', recordLabel:'心情', recordDetail:mood.label || '一般', icon:'mood', tags:[],
        },
        ai:{
          id:`focused-mood-${stamp}-ai`, time, kind:'chart', chartType:'moodWeek',
          title:'近 7 天心情变化', note:`已记下“${mood.label || '一般'}”。近一周情绪整体较平稳。`,
        },
      });
      return;
    }
    if(recordFeedback){
      const history = collectTodayQuickMoodHistory();
      const isFirst = history.length === 0;
      if(!isFirst) moodGuideQueueRef.current = null;
      const entry = isFirst
        ? window.createMoodRecordEntry(moods)
        : window.createMoodQuickEntry(moods, history);
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId('', timeline);
      if(tryStartFirstDrop(entry, '')){
        return;
      }
      setTimeline(blocks=>{
        const cleaned = !isFirst ? blocks.map(b=>{
          if(b.type !== 'day') return b;
          const items = (b.items || b.entries || []).filter(it=>!(it.kind === 'guide' && it.alwaysShow));
          return { ...b, items, entries: undefined };
        }) : blocks;
        return window.appendTimelineEntry(cleaned, entry, { dayId });
      });
      return;
    }
    const entry = window.createMoodRecordEntryLegacy(moods);
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
  };

  const appendSymptomRecord = (symptoms, { allowFirstDrop = false } = {})=>{
    markUserRecorded();
    const entry = window.createSymptomRecordEntry(symptoms);
    if(focusedInputPathsDemo){
      appendFocusedStructuredFlow(entry);
      return;
    }
    if(allowFirstDrop && recordFeedback && tryStartFirstDrop(entry, entry.body || '')) return;
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
  };

  const submitSymptomRecord = (symptoms)=>{
    appendSymptomRecord(symptoms, { allowFirstDrop: true });
  };

  const submitFocusedPeriodRecord = (quickType = 'period')=>{
    if(!focusedInputPathsDemo) return;
    if(quickType === 'water'){
      submitFocusedWaterRecord();
      return;
    }
    markUserRecorded();
    const stamp = Date.now();
    const time = '19:05';
    appendFocusedStructuredFlow({
      kind:'record-group',
      id:`focused-period-start-${stamp}`,
      primary:{
        id:`focused-period-start-${stamp}-primary`,
        time,
        kind:'period',
        periodLabel:'月经来了',
        text:'月经来了',
        tags:[{cat:'月经', val:'', icon:'period'}],
      },
      ai:{
        id:`focused-period-start-${stamp}-ai`, time, kind:'chart',
        title:'本次经期分析', note:'已记录本次经期开始。结合近 3 次记录，周期约 29 天；继续记录经量和症状后，会更新本次周期分析。',
      },
    });
  };

  const submitFocusedWaterRecord = ()=>{
    if(!focusedInputPathsDemo) return;
    markUserRecorded();
    const amount = 300;
    const stamp = Date.now();
    const time = window.formatNowTime?.() || '19:00';
    appendFocusedStructuredFlow({
      id:`focused-water-${stamp}`,
      primary:{
        id:`focused-water-${stamp}-primary`, time, kind:'daily-record',
        recordType:'beverage', recordLabel:'喝水', recordDetail:`白水 · ${amount}ml`, icon:'beverage',
        beverageName:'白水', beverageCategory:'水', capacityMl:amount,
        calories:0, caffeineMg:0, tags:[],
      },
      ai:{
        id:`focused-water-${stamp}-ai`, time, kind:'chart', chartType:'dailyGoal',
        title:'今日饮水进度', chartData:{kind:'water', consumed:850, goal:1500, unit:'ml'},
        note:`本次喝水 ${amount}ml，已计入今天的饮水进度。`,
      },
    });
  };

  const submitRecordTabSymptomRecord = (symptoms)=>{
    appendSymptomRecord(symptoms);
    if(activeTab !== 'note') setNoteTabUnread(true);
  };

  const submitWeightRecord = (payload)=>{
    markUserRecorded();
    const entry = window.createWeightRecordEntry(payload);
    if(focusedInputPathsDemo){
      const mockTime = '19:05';
      if(entry.primary) entry.primary = {...entry.primary, time:mockTime};
      if(entry.ai) entry.ai = {...entry.ai, time:mockTime};
      appendFocusedStructuredFlow(entry);
      return;
    }
    if(payload?.source === 'camera' || payload?.photoUrl){
      entry.weightSource = 'camera';
      entry.photoUrl = payload.photoUrl || null;
      if(entry.primary) entry.primary.photoUrl = payload.photoUrl || null;
    }
    const entryText = entry.primary?.weightValue || entry.primary?.text || entry.body || '';
    if(recordFeedback && tryStartFirstDrop(entry, entryText)) return;
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
  };

  const submitPeriodDetailRecord = ({ type, value })=>{
    if(!type || !value) return;
    markUserRecorded();
    setPeriodDetailDraft((prev)=>({ ...prev, [type]: value }));
    setPeriodDetailRecordEnabled(true);
  };

  const submitHealthRecord = (payload)=>{
    if(!payload?.type || !payload?.value) return;
    markUserRecorded();
    setHealthRecordDrafts((prev)=>[...prev, payload]);
  };

  const submitFoodRecord = (foods)=>{
    markUserRecorded();
    if(focusedInputPathsDemo){
      const list = Array.isArray(foods) ? foods : [foods];
      const labels = list.map(food=>food?.label).filter(Boolean);
      const stamp = Date.now();
      const time = window.formatNowTime?.() || '19:00';
      appendFocusedStructuredFlow({
        id:`focused-diet-${stamp}`,
        primary:{
          id:`focused-diet-${stamp}-primary`, time, kind:'daily-record',
          recordType:'diet', recordLabel:'饮食', recordDetail:labels.join('、') || '已记录', icon:'diet', tags:[],
        },
        ai:{
          id:`focused-diet-${stamp}-ai`, time, kind:'chart',
          title:'饮食分析', note:`已记录${labels.join('、') || '本次饮食'}，之后可以和当天其他饮食一起回顾。`,
        },
      });
      return;
    }
    const entry = window.createFoodRecordEntry(foods);
    if(recordFeedback && tryStartFirstDrop(entry, entry.body || '')) return;
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
  };

  const submitDietCapture = (payload)=>{
    markUserRecorded();
    const entry = window.createDietCaptureGroup?.({
      photoUrl: payload?.photoUrl || payload?.photo?.thumb || null,
    });
    if(!entry) return;
    entry.isNew = true;
    if (payload?.recognitionState) {
      entry.recognitionState = payload.recognitionState;
    }
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
  };

  React.useEffect(()=>{
    const handlePhotoNoteSave = (event)=>{
      const entryId = event?.detail?.entryId;
      const note = String(event?.detail?.note || '').trim();
      if(!entryId) return;
      setTimeline(blocks=>blocks.map(block=>{
        if(block.type !== 'day') return block;
        const items = (block.items || block.entries || []).map(item=>{
          if(item?.id !== entryId && item?.primary?.id !== entryId) return item;
          return item.primary
            ? { ...item, primary:{ ...item.primary, note } }
            : { ...item, note };
        });
        return { ...block, items, entries:undefined };
      }));
    };
    window.addEventListener('timelinePhotoNoteSave', handlePhotoNoteSave);
    return ()=>window.removeEventListener('timelinePhotoNoteSave', handlePhotoNoteSave);
  }, []);

  const submitCameraRecord = (payload)=>{
    if(focusedInputPathsDemo && payload?.mode === 'water'){
      markUserRecorded();
      const amount = Math.max(1, Math.round(Number(payload.capacityMl ?? payload.value) || 300));
      const stamp = Date.now();
      const time = window.formatNowTime?.() || '19:00';
      appendFocusedStructuredFlow({
        id:`focused-water-${stamp}`,
        primary:{
          id:`focused-water-${stamp}-primary`, time, kind:'daily-record',
          recordType:'beverage', recordLabel:'喝水', recordDetail:`白水 · ${amount}ml`, icon:'beverage',
          beverageName:'白水', beverageCategory:'水', capacityMl:amount,
          calories:0, caffeineMg:0, tags:[],
        },
        ai:{
          id:`focused-water-${stamp}-ai`, time, kind:'chart', chartType:'dailyGoal',
          title:'今日饮水进度', chartData:{kind:'water', consumed:550 + amount, goal:1500, unit:'ml'},
          note:`本次喝水 ${amount}ml，已计入今天的饮水进度。`,
        },
      });
      return;
    }
    if(payload?.mode === 'photo'){
      markUserRecorded();
      const stamp = Date.now();
      const entry = {
        kind:'record-group',
        id:`e-photo-camera-${stamp}-g`,
        isNew:true,
        cameraSource:'photo',
        photoUrl:payload.photoUrl || null,
        primary:{
          id:`e-photo-camera-${stamp}`,
          time:window.formatNowTime(),
          kind:'daily-record',
          recordType:'photo',
          icon:'photo',
          recordLabel:'照片',
          recordDetail:'',
          text:'',
          photoUrl:payload.photoUrl || null,
          note:'',
          dayLabel:'今天',
          tags:[],
        },
      };
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId('', timeline);
      setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
      if(payload.fallbackFromBeverage){
        pushToast({
          text:'未识别到饮品信息，帮您创建照片卡片',
          placement:'center',
          duration:3000,
        });
      }
      setTimeout(()=>scrollTimelineToBottom('smooth'), 80);
      return;
    }

    if(payload?.mode === 'weight'){
      submitWeightRecord({
        value:Number(payload.value) || 108.4,
        unit:payload.unit === 'kg' ? 'kg' : 'jin',
        photoUrl:payload.photoUrl || null,
        source:'camera',
      });
      setTimeout(()=>scrollTimelineToBottom('smooth'), 80);
      return;
    }

    const detectedRecordMeta = {
      period:{ label:'月经', icon:'flow', detail:'经量多，颜色鲜红色' },
      discharge:{ label:'白带', icon:'discharge', detail:'淡黄色，黏稠' },
      beverage:{
        label:'喝水',
        icon:'beverage',
        buildDetail:(data)=>{
          const name = `${data.brand || ''}${data.beverageName || ''}`.trim()
            || data.beverageCategory
            || '饮品';
          return `${name}${data.capacityMl ? ` · ${data.capacityMl}ml` : ''}`;
        },
        buildAi:(data)=>({
          title:'今日饮水进度',
          chartType:'dailyGoal',
          chartData:{
            kind:'water',
            consumed:Math.min(1500, 550 + (Number(data.capacityMl) || 0)),
            goal:1500,
            unit:'ml',
          },
          note:'',
        }),
      },
      skin:{
        label:'皮肤状态',
        icon:'skin',
        buildDetail:(data)=>`${data.area || ''}有${data.acne || ''}痘痘，${data.redness || ''}泛红`,
        buildAi:()=>({
          title:'AI 皮肤状态反馈',
          note:'你在黄体后期，雌激素下降，该时期长痘是常见现象。',
        }),
      },
      cosmetic:{
        label:'化妆品',
        icon:'cosmetic',
        buildDetail:(data)=>`${data.brand || ''} ${data.product || ''} · ${data.managementStatus || ''}`,
        buildAi:()=>({
          title:'AI 化妆品反馈',
          note:'这款精华水适合油性肤质，很适合你最近的皮肤状态。',
        }),
      },
      stool:{ label:'便便', icon:'stool', detail:'布里斯托 2 型，黄褐色' },
    }[payload?.mode];
    if(detectedRecordMeta){
      markUserRecorded();
      const stamp = Date.now();
      const detail = detectedRecordMeta.buildDetail?.(payload)
        || payload?.summary
        || detectedRecordMeta.detail;
      const aiFeedback = detectedRecordMeta.buildAi?.(payload);
      const entry = {
        kind:'record-group',
        id:`e-${payload.mode}-camera-${stamp}-g`,
        isNew:true,
        staggerReveal:!!aiFeedback,
        aiDefaultOpen:!!aiFeedback,
        cameraSource:payload.mode,
        photoUrl:payload.photoUrl || null,
        primary:{
          id:`e-${payload.mode}-camera-${stamp}`,
          time:window.formatNowTime(),
          kind:'daily-record',
          recordType:payload.mode,
          icon:detectedRecordMeta.icon,
          recordLabel:detectedRecordMeta.label,
          recordDetail:detail,
          text:`${detectedRecordMeta.label}：${detail}`,
          photoUrl:payload.photoUrl || null,
          brand:payload.brand,
          beverageName:payload.beverageName,
          beverageCategory:payload.beverageCategory,
          capacityMl:payload.capacityMl,
          iceLevel:'',
          sugarLevel:'',
          spec:payload.capacityMl ? `${payload.capacityMl}ml` : '',
          calories:payload.calories,
          caffeineMg:payload.caffeineMg,
          inputSource:'camera-beverage',
          area:payload.area,
          acne:payload.acne,
          redness:payload.redness,
          acneMarks:payload.acneMarks,
          product:payload.product,
          managementStatus:payload.managementStatus,
          tags:[],
        },
        ai:aiFeedback ? {
          id:`e-${payload.mode}-camera-${stamp}-ai`,
          time:window.formatNowTime(),
          kind:'camera-ai-feedback',
          ...aiFeedback,
        } : null,
      };
      const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
        || window.resolveEntryDayId('', timeline);
      setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
      setTimeout(()=>scrollTimelineToBottom('smooth'), 80);
      return;
    }

    if(payload?.mode !== 'water') return;
    const amount = Math.max(1, Math.round(Number(payload.capacityMl ?? payload.value) || 300));
    const category = payload.beverageCategory || '水';
    const isWater = category === '水';
    const brand = isWater ? '' : (payload.brand || '');
    const beverageName = isWater ? '白水' : (payload.beverageName || '');
    const iceLevel = '';
    const sugarLevel = '';
    const calories = isWater ? 0 : (Number(payload.calories) || 0);
    const caffeineMg = isWater ? 0 : (Number(payload.caffeineMg) || 0);
    const specParts = [`${amount}ml`];
    const recordName = `${brand}${beverageName}`.trim() || category;
    const recordDetail = `${recordName} · ${specParts.join('/')}`;
    if(recordLifeMode === '育儿'){
      handleBabyFeedingQuickSelect({
        id:'water-camera',
        label:'喝水',
        cardIcon:'💧',
        iconSrc:'assets/baby-feeding-icons/water.png',
        color:'#5B8DEF',
        value:`${amount}ml`,
        text:`喝水：${amount}ml`,
        photoUrl:payload.photoUrl || null,
      });
      return;
    }

    markUserRecorded();
    const stamp = Date.now();
    const todayTotal = Math.min(1500, 550 + amount);
    const entry = {
      kind:'record-group',
      id:'e-water-camera-'+stamp+'-g',
      isNew:true,
      staggerReveal:true,
      aiDefaultOpen:true,
      cameraSource:'water',
      photoUrl:payload.photoUrl || null,
      primary:{
        id:'e-water-camera-'+stamp,
        time:window.formatNowTime(),
        kind:'daily-record',
        recordType:'beverage',
        icon:'beverage',
        recordLabel:'喝水',
        recordDetail,
        text:`喝水：${recordDetail}`,
        brand,
        beverageName,
        beverageCategory:category,
        capacityMl:amount,
        iceLevel,
        sugarLevel,
        spec:specParts.join(' / '),
        calories,
        caffeineMg,
        inputSource:category === '水' ? 'manual-water' : 'manual-beverage',
        tags:[],
      },
      ai:{
        id:'e-water-camera-'+stamp+'-ai',
        time:window.formatNowTime(),
        kind:'camera-ai-feedback',
        title:'今日饮水进度',
        chartType:'dailyGoal',
        chartData:{
          kind:'water',
          consumed:todayTotal,
          goal:1500,
          unit:'ml',
        },
        note:'',
      },
    };
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
    setTimeout(()=>scrollTimelineToBottom('smooth'), 80);
  };

  const buildRecordTabDietWeekData = (todayTotalKcal)=>{
    const seed = [720, 1820, 1960, 1480, 1800];
    return [...seed, Math.max(620, Math.round(todayTotalKcal * 0.88)), todayTotalKcal];
  };

  const buildRecordTabDietContext = (record, records)=>{
    const list = Array.isArray(records) ? records : [record].filter(Boolean);
    const dayMealCount = list.length;
    const dayTotalKcal = list.reduce((sum, item)=>sum + (item?.totalKcal || 0), 0);
    const todayFoodCount = new Set(
      list.flatMap((item)=>item?.foodNames || [])
    ).size;
    const buildDietUserContext = window.buildDietUserContext || ((data, extra = {}) => ({ ...data, ...extra }));
    const scenarioSeed = {
      totalKcal: record?.totalKcal || 0,
      weekData: buildRecordTabDietWeekData(dayTotalKcal),
      daysWithRecord: 6,
      avgKcal: 1380,
      items: record?.foods || [],
    };
    return buildDietUserContext(scenarioSeed, {
      dayMealCount,
      dayTotalKcal,
      todayFoodCount,
      totalRecordDays: 6,
      weekData: buildRecordTabDietWeekData(dayTotalKcal),
    });
  };

  const submitRecordTabDietRecord = (record, records = [])=>{
    if(!record?.foods?.length) return;
    markUserRecorded();
    const time = record.mealTime || window.formatNowTime();
    const userContext = buildRecordTabDietContext(record, records);
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    let entry = null;

    if(record.sourceType === 'camera' && record.photoUrl){
      entry = {
        kind: 'diet-photo-feedback',
        id: 'e-diet-record-' + Date.now(),
        time,
        photoUrl: record.photoUrl,
        recognitionScenario: 'success',
        recognitionState: 'ready',
        displayScenario: window.readDietFeedbackDisplayScenario?.() || 'dim-b',
        dietData: {
          time,
          foods: record.foodNames || [],
          items: record.foods || [],
          totalKcal: record.totalKcal || 0,
          matchStatus: 'all',
          foodTags: [],
          fromRecordSync: true,
        },
        userContext,
        leadingIconSrc: 'assets/quick-icon-diet.png',
        leadingLabel: '饮食：',
        isNew: true,
      };
    } else {
      entry = {
        kind: 'diet-text-feedback',
        id: 'e-diet-record-' + Date.now(),
        time,
        displayScenario: window.readDietFeedbackDisplayScenario?.() || 'dim-b',
        dietData: {
          time,
          items: record.foods || [],
          totalKcal: record.totalKcal || 0,
          matchStatus: 'all',
          foodTags: [],
          fromRecordSync: true,
        },
        userContext,
        leadingIconSrc: 'assets/quick-icon-diet.png',
        leadingLabel: '饮食：',
        isNew: true,
      };
    }

    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
    if(activeTab !== 'note') setNoteTabUnread(true);
  };

  const submitRecordTabMoodRecord = (record)=>{
    if(!record?.value) return;
    markUserRecorded();
    const stamp = Date.now();
    const entry = {
      kind:'record-group',
      id:'e-record-mood-'+stamp,
      isNew:true,
      primary:{
        id:'e-record-mood-primary-'+stamp,
        time: window.formatNowTime(),
        kind:'daily-record',
        recordType:'mood',
        recordLabel:'心情',
        recordValue:record.value,
        recordDetail:record.detail || record.value,
        icon:'mood',
        iconText:'',
        text:`心情：${record.detail || record.value}`,
        tags:[{ label:'心情', cat:'心情', val:record.value, icon:'mood' }],
      },
    };
    const dayId = timeline.find(b=>b.type==='day' && b.isToday)?.id
      || window.resolveEntryDayId('', timeline);
    setTimeline(blocks=>window.appendTimelineEntry(blocks, entry, { dayId }));
    if(activeTab !== 'note') setNoteTabUnread(true);
  };

  const submitPhoto = ()=>{
    setShowPhoto(false);
    markUserRecorded();
    const entry = {
      id:'e-'+Date.now(),
      time: window.formatNowTime(),
      body:'',
      photo:true, photoTone:'warm', photoEmoji:'🌸',
      isNew: true,
      tags:[{ emoji:'📷', label:'照片' }],
    };
    pushToTimeline(entry, '');
  };

  const sceneForHealth = {
    status: ctx.status,
    healthTitle: ctx.healthTitle,
    healthDesc: ctx.healthDesc,
    phaseLabel: ctx.cycle.label,
    phaseKind: ctx.cycle.kind,
    dayNum: ctx.cycle.dayNum,
    dayLbl: '今日',
  };

  const showRecordTab = scene.calendar.enabled && activeTab === 'cal';
  const showHome = activeTab === 'home';
  const showReview = activeTab === 'cash';
  const showMe = activeTab === 'me';
  const showFloatNotice = scene.floatNotice.enabled && showAnalysisNotice && activeTab === 'cal';
  const showRecordShell = activeTab === 'note';
  const showTodayGuide = noteScene.record.todayGuide && !hideTodayGuide;

  const I = window.Icon;
  const DemoSceneBar = window.DemoSceneBar;
  const CameraPermissionScenarioBar = window.CameraPermissionScenarioBar;
  const DietRecognitionScenarioBar = window.DietRecognitionScenarioBar;
  const DietFeedbackDisplayScenarioBar = window.DietFeedbackDisplayScenarioBar;
  const DietFeedbackComboScenarioBar = window.DietFeedbackComboScenarioBar;
  const RecordEmptyScreen = window.RecordEmptyScreen;
  const RecordBlankStream = window.RecordBlankStream;
  const EmptyPreviewGuideLayer = window.EmptyPreviewGuideLayer;
  const StreamSearchOverlay = window.StreamSearchOverlay;
  const XhsStyleSearchPage = window.XhsStyleSearchPage;
  const ReviewPage = window.ReviewPage;
  const HomePage = window.HomePage;
  const MePage = window.MePage;
  const VoiceTranscribeInputLayer = window.VoiceTranscribeInputLayer;

  const toggleSearchPage = ()=>{
    if(showBabyFeedingHeader){
      setBabyFeedingPanelMode((prev)=> prev === 'search' ? null : 'search');
      return;
    }
    setShowSearchPage((prev)=> !prev);
  };
  const toggleBabyFeedingAllPanel = ()=>{
    setBabyFeedingPanelMode((prev)=> prev === 'all' ? null : 'all');
  };
  const closeBabyFeedingPanel = ()=>{
    setBabyFeedingPanelMode(null);
  };
  const handleBabyFeedingFilterSelect = ({ personId, option })=>{
    setSearchCriteria({
      personPanelFilter: { personId, option },
      query: '',
      filterId: null,
    });
    setBabyFeedingPanelMode(null);
    requestAnimationFrame(()=>{
      setTimeout(()=>scrollTimelineToFirstItem('smooth'), 80);
    });
  };
  const handleBabyFeedingFilterClear = ()=>{
    setSearchCriteria(null);
  };
  const scrollTimelineToFirstItem = (behavior='smooth')=>{
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        const el = streamRef.current;
        if(!el) return;
        const anchor = el.querySelector('[data-entry-id]');
        if(!anchor){
          if(behavior === 'auto') el.scrollTop = 0;
          else el.scrollTo({ top: 0, behavior });
          return;
        }
        const header = el.parentElement?.querySelector('.stream-header');
        const headerH = header?.getBoundingClientRect().height || 0;
        const top = anchor.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - headerH - 12;
        if(behavior === 'auto') el.scrollTop = Math.max(0, top);
        else el.scrollTo({ top: Math.max(0, top), behavior });
      }, 80);
    });
  };
  const restoreSearchCloseScroll = React.useCallback(()=>{
    const saved = searchCloseScrollRef.current;
    if(!saved) return;
    const stream = streamRef.current;
    if(!stream) return;
    const { anchorId, scrollTop } = saved;
    if(anchorId){
      const el = stream.querySelector(`[data-entry-id="${anchorId}"]`);
      if(el){
        const top = el.getBoundingClientRect().top - stream.getBoundingClientRect().top + stream.scrollTop - 28;
        stream.scrollTop = Math.max(0, top);
        return;
      }
    }
    stream.scrollTop = scrollTop;
  }, []);
  const closeSearchPage = ()=> {
    const filterTimelineForSearchFn = window.filterTimelineForSearch;
    const filtered = (searchCriteria && filterTimelineForSearchFn)
      ? filterTimelineForSearchFn(timeline, searchCriteria)
      : timeline;
    searchCloseScrollRef.current = {
      anchorId: window.getSearchAnchorEntryId?.(filtered),
      scrollTop: streamRef.current?.scrollTop ?? 0,
    };
    setShowSearchPage(false);
    setSearchCriteria(null);
  };
  const handleTimelineSearch = (criteria)=> setSearchCriteria(criteria);
  const handleTimelineSearchClear = ()=> setSearchCriteria(null);
  const handleTimelineDateSelect = React.useCallback((recordDate)=>{
    if(!recordDate?.dayId) return;
    setShowSearchPage(false);
    setSearchCriteria(null);
    const scrollToDay = ()=>{
      const stream = streamRef.current;
      if(!stream) return;
      const el = stream.querySelector(`[data-day-id="${recordDate.dayId}"]`);
      if(!el) return;
      const header = stream.parentElement?.querySelector('.stream-header');
      const headerH = header?.getBoundingClientRect().height || 0;
      const top = el.getBoundingClientRect().top - stream.getBoundingClientRect().top + stream.scrollTop - headerH - 18;
      stream.scrollTop = Math.max(0, top);
    };
    requestAnimationFrame(()=>requestAnimationFrame(scrollToDay));
  }, []);

  const filterTimelineForSearch = window.filterTimelineForSearch;
  const countTimelineSearchItems = window.countTimelineSearchItems;
  const isSearchActive = !!(searchCriteria && (
    searchCriteria.query?.trim()
    || searchCriteria.filterId
    || searchCriteria.personPanelFilter
  ));
  const displayTimeline = React.useMemo(()=>{
    const modeTimeline = recordLifeMode === '经期'
      ? (timeline || []).map(block=>{
          if(block.type !== 'day') return block;
          const originalItems = block.items || block.entries || [];
          const items = originalItems.filter(item=>item.kind !== 'baby-feeding-card');
          if(items.length === originalItems.length) return block;
          if(items.length === 0) return null;
          return {...block, items, entries:undefined};
        }).filter(Boolean)
      : timeline;
    const source = (recordLifeMode === '育儿' && babyFeedingEntryActive)
      ? (modeTimeline || []).map(block=>{
          if(block.type !== 'day') return block;
          const items = block.items || block.entries || [];
          const hasBabyFeeding = items.some(item=>item.kind === 'baby-feeding-card');
          if(block.relativeLabel === '昨天'){
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const weekday = ['周日','周一','周二','周三','周四','周五','周六'][yesterday.getDay()];
            return {
              ...block,
              date:`${yesterday.getMonth() + 1}/${yesterday.getDate()}`,
              weekday,
              isToday:false,
            };
          }
          if(!hasBabyFeeding && !block.isToday) return block;
          if(!hasBabyFeeding && block.isToday) return {...block, isToday:false};
          const now = new Date();
          const weekday = ['周日','周一','周二','周三','周四','周五','周六'][now.getDay()];
          return {
            ...block,
            date:`${now.getMonth() + 1}/${now.getDate()}`,
            weekday,
            isToday:true,
          };
        })
      : modeTimeline;
    if(!isSearchActive || !filterTimelineForSearch) return source;
    return filterTimelineForSearch(source, searchCriteria);
  }, [timeline, searchCriteria, isSearchActive, filterTimelineForSearch, recordLifeMode, babyFeedingEntryActive]);
  const searchResultCount = React.useMemo(()=>{
    if(!isSearchActive || !countTimelineSearchItems) return null;
    return countTimelineSearchItems(displayTimeline);
  }, [displayTimeline, isSearchActive, countTimelineSearchItems]);

  React.useLayoutEffect(()=>{
    if(searchCriteria) return;
    if(!searchCloseScrollRef.current) return;
    restoreSearchCloseScroll();
    requestAnimationFrame(()=>{
      restoreSearchCloseScroll();
      searchCloseScrollRef.current = null;
    });
  }, [searchCriteria, restoreSearchCloseScroll]);

  const [homeDetailOpen, setHomeDetailOpen] = React.useState(false);
  const showBottomTabBar = !homeDetailOpen;
  const showScheme3Bubble = isScheme3 && showBlankEmpty
    && window.shouldShowScheme3Bubble?.();
  const highlightScheme3Input = isScheme3 && showBlankEmpty
    && scheme3FirstVisitRef.current;
  const showBabyFeedingQuickStrip = showRecordShell
    && !showRecordEmpty
    && !showRecordBlank
    && recordLifeMode === '育儿'
    && babyFeedingEntryActive
    && !isSearchActive
    && !voiceTranscribe;
  const showPeriodQuickStrip = showRecordShell
    && !showRecordEmpty
    && !showRecordBlank
    && recordLifeMode === '经期'
    && !isSearchActive
    && !voiceTranscribe;
  const showDockQuickStrip = showBabyFeedingQuickStrip || showPeriodQuickStrip;
  const showBabyFeedingHeader = showRecordShell
    && !showRecordEmpty
    && !showRecordBlank
    && recordLifeMode === '育儿'
    && !voiceTranscribe;
  const showStreamHeader = showBabyFeedingHeader ? true : !showSearchPage;
  const babyFeedingDockItems = showBabyFeedingQuickStrip
    ? BABY_FEEDING_QUICK_ITEMS.map(item=>({
        ...item,
        iconNode:item.iconSrc
          ? <img src={item.iconSrc} alt="" />
          : <BabyFeedingQuickIcon type={item.id}/>,
      }))
    : null;
  const periodDockQuickItems = showPeriodQuickStrip
    ? [
        ...(periodFeelVisible ? [{id:'period-feel', label:'经期感受', action:'period-feel', icon:'💧', pulse:periodFeelReady, drop:false}] : []),
        ...PERIOD_DOCK_QUICK_ITEMS,
      ].map(item=>({
        ...item,
        iconNode:item.id === 'custom'
          ? <CustomQuickIcon />
          : item.id === 'stool' && item.iconSrc
          ? <img src={item.iconSrc} alt="" />
          : (window.UnifiedQuickIcon
            ? <UnifiedQuickIcon type={item.id === 'beverage' ? 'water' : item.id}/>
            : (item.iconSrc ? <img src={item.iconSrc} alt="" /> : null)),
      }))
    : null;
  const dockQuickItems = babyFeedingDockItems || periodDockQuickItems;

  return (
    <>
      <div className={'phone' + (homeDetailOpen ? ' is-home-detail-open' : '') + (showDockQuickStrip ? ' is-dock-quick-entry' : '')}>
        <StatusBar isMember={isMember} onMemberChange={setIsMember} showMemberSwitch={showReview}/>

      {showHome && HomePage && (
        <HomePage
          mode={recordLifeMode}
          hideBabyVoiceCoach={babyVoiceCoachHidden}
          onDetailOpenChange={setHomeDetailOpen}
          onFeedingRecordClick={handleFeedingRecordEntry}
        />
      )}

      {showMe && MePage && (
        <MePage
          shareState={reviewShareState}
          partnerPreviewOpen={partnerPreviewOpen}
          onPartnerPreviewOpenChange={setPartnerPreviewOpen}
          onShareStateChange={setReviewShareState}
        />
      )}

      {showRecordTab && (
        <RecordPage
          key={scene.id}
          periodFlowEnabled={scene.calendar.periodFlow}
          periodEndRecordReady={periodEndRecordReady}
          periodEndRecordCompleted={periodEndRecordCompleted}
          activeModeLabel={recordLifeMode}
          onAnalysisReady={()=>{
            setAnalysisNoticeTitle(PERIOD_START_NOTICE_TITLE);
            setAnalysisNoticeKind('period-start');
            setShowAnalysisNotice(true);
          }}
          onPeriodEndAnalysisReady={()=>{
            setAnalysisNoticeTitle('本次月经长度8天，较前两次明显延长，点击查看');
            setAnalysisNoticeKind('period-end');
            setShowAnalysisNotice(true);
          }}
          onPeriodReset={()=>{
            setShowAnalysisNotice(false);
            setPeriodFeelVisible(false);
            setPeriodFeelReady(false);
            setPeriodFeelModalOpen(false);
            setAnalysisNoticeTitle(PERIOD_START_NOTICE_TITLE);
            setAnalysisNoticeKind('period-start');
            setPeriodEndRecordReady(false);
            setPeriodEndRecordCompleted(false);
            setPeriodDetailRecordEnabled(false);
            setPeriodDetailDraft({});
          }}
          onModeChange={handleRecordModeChange}
          onPeriodRecordSubmit={(value)=>{
            periodRecordRef.current = value || null;
            setPeriodDetailRecordEnabled(true);
          }}
          onPeriodDetailRecordSubmit={submitPeriodDetailRecord}
          onDietRecordSubmit={submitRecordTabDietRecord}
          onSymptomRecordSubmit={submitRecordTabSymptomRecord}
          onMoodRecordSubmit={submitRecordTabMoodRecord}
          onHealthRecordSubmit={submitHealthRecord}
          periodDetailValues={periodDetailDraft}
          periodDetailDemoEnabled={periodDetailRecordEnabled || periodEndRecordCompleted}
          onEmptyPreviewEnter={handleEmptyPreviewEnter}
        />
      )}

      {scene.floatNotice.enabled && (
        <FloatNotice
          show={showFloatNotice}
          title={analysisNoticeTitle}
          onOpen={openSisterAnalysis}
          onClose={()=>setShowAnalysisNotice(false)}
        />
      )}

      {showReview && ReviewPage && (
        <ReviewPage
          mode={recordLifeMode}
          isMember={isMember}
          openCycleDetailRequest={reviewCycleOpenRequest}
          onCycleDetailRequestHandled={()=>setReviewCycleOpenRequest(0)}
          onCycleDetailReturn={()=>{
            if(!reviewCycleReturnTab) return;
            const returnTab = reviewCycleReturnTab;
            setReviewCycleReturnTab(null);
            setActiveTab(returnTab);
          }}
          openWeightDetailRequest={reviewWeightOpenRequest}
          onWeightDetailRequestHandled={()=>setReviewWeightOpenRequest(0)}
          onWeightDetailReturn={()=>{
            if(!reviewWeightReturnTab) return;
            const returnTab = reviewWeightReturnTab;
            setReviewWeightReturnTab(null);
            setActiveTab(returnTab);
          }}
          openDietDetailRequest={reviewDietOpenRequest}
          onDietDetailRequestHandled={()=>setReviewDietOpenRequest(0)}
          onDietDetailReturn={()=>{
            if(!reviewDietReturnTab) return;
            const returnTab = reviewDietReturnTab;
            setReviewDietReturnTab(null);
            setActiveTab(returnTab);
          }}
          openMoodDetailRequest={reviewMoodOpenRequest}
          onMoodDetailRequestHandled={()=>setReviewMoodOpenRequest(0)}
          onMoodDetailReturn={()=>{
            if(!reviewMoodReturnTab) return;
            const returnTab = reviewMoodReturnTab;
            setReviewMoodReturnTab(null);
            setActiveTab(returnTab);
          }}
          shareState={reviewShareState}
          onShareStateChange={setReviewShareState}
          onOpenPartnerPreview={()=>{
            setPartnerPreviewOpen(true);
            setActiveTab('me');
          }}
        />
      )}

      <div
        className={'suiji-shell suiji-shell--scene'+(showRecordEmpty ? ' suiji-shell--empty' : '')+(showRecordBlank ? ' suiji-shell--blank' : '')+(voiceTranscribe ? ' suiji-shell--voice' : '')+(showRecordShell ? '' : ' app-view-hidden')+(dockExpanded?' is-mood-expanded':'')+(showSearchPage && !showBabyFeedingHeader ? ' is-search-open':'')+(babyFeedingPanelMode === 'all' ? ' is-filter-panel-open':'')+(babyFeedingPanelMode === 'search' ? ' is-xhs-search-open':'')+(isSearchActive?' is-search-filtered':'')}
        aria-hidden={!showRecordShell}
      >
        {showRecordEmpty ? (
          <RecordEmptyScreen onVoiceDone={submitVoice}/>
        ) : showRecordBlank ? (
        <>
        <RecordBlankStream
          streamRef={streamRef}
          timelineEndRef={timelineEndRef}
          timeline={timeline}
          scene={noteScene}
          onOpenCalendar={()=>setActiveTab('cal')}
          onOpenSearch={toggleSearchPage}
          sisterPlayAnimation={sisterPlayAnimation}
          sisterCycleDone={sisterCycleDone}
          hideTodayGuide={!showTodayGuide}
          onSisterCycleComplete={handleSisterCycleComplete}
          emptyPreviewGuideStep={emptyPreviewGuideStep}
          onEmptyPreviewGuideAdvance={advanceEmptyPreviewGuide}
        />
        {showScheme1Hints ? (
          <div className="rb-s1-curly-arrow" aria-hidden="true">
            <img src="assets/curly-arrow-pink.png" alt=""/>
          </div>
        ) : null}
        {emptyPreviewMode && EmptyPreviewGuideLayer ? (
          <EmptyPreviewGuideLayer
            step={emptyPreviewGuideStep}
            onAdvance={advanceEmptyPreviewGuide}
          />
        ) : null}
        {!voiceTranscribe && (
        <DockPublisher
          draft={draft}
          onDraft={setDraft}
          onSend={()=>submitText()}
          onQuickMark={submitQuickMark}
          onMoodConfirm={submitMoodRecord}
          onSymptomConfirm={submitSymptomRecord}
          onWeightConfirm={submitWeightRecord}
          onFoodConfirm={submitFoodRecord}
          onDietCapture={submitDietCapture}
          onCameraRecord={submitCameraRecord}
          onVoiceDone={submitVoice}
          onPhoto={()=>setShowPhoto(true)}
          onDockExpandedChange={setDockExpanded}
          activeTab={activeTab}
          defaultInputMode={(showScheme1Hints || emptyPreviewMode) ? 'voice' : 'text'}
          showScheme3Bubble={showScheme3Bubble}
          highlightScheme3Input={highlightScheme3Input}
          demoPhase={demoPhase}
          isDemoRunning={isDemoRunning}
          structuredVoiceDemo={new URLSearchParams(window.location.search).get('demo') === 'structured-timeline-v2'}
          focusedInputDemo={focusedInputDemo}
          focusedLegacyVoiceDemo={focusedInputPathsDemo}
          onPeriodStartQuick={submitFocusedPeriodRecord}
          emptyPreviewGuideStep={emptyPreviewGuideStep}
          onEmptyPreviewGuideAdvance={advanceEmptyPreviewGuide}
          onEmptyPreviewGuideDismiss={dismissEmptyPreviewGuide}
          fabGuidePulse={emptyPreviewGuideStep === 2}
        />
        )}
        </>
        ) : (
        <>
        {showStreamHeader ? (
        <div className={'stream-header' + (showBabyFeedingHeader ? ' is-baby-feeding-header' : '')}>
          {showBabyFeedingHeader ? (
            <>
              <div className="stream-actions">
                <button
                  className={'stream-action' + (babyFeedingPanelMode === 'search' ? ' is-active' : '')}
                  aria-label="搜索"
                  aria-pressed={babyFeedingPanelMode === 'search'}
                  type="button"
                  onClick={toggleSearchPage}
                >
                  <I name="search" size={20} stroke={1.7}/>
                </button>
              </div>
              <button
                type="button"
                className={'stream-filter-center' + (babyFeedingPanelMode === 'all' ? ' is-open' : '') + (searchCriteria?.personPanelFilter ? ' is-filtered' : '')}
                aria-expanded={babyFeedingPanelMode === 'all'}
                onClick={toggleBabyFeedingAllPanel}
              >
                <span>全部</span>
                <svg className="stream-filter-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="stream-header-side"/>
            </>
          ) : (
            <>
              <div className="stream-actions">
                <button
                  className={'stream-action' + (showSearchPage ? ' is-active' : '')}
                  aria-label="搜索"
                  aria-pressed={showSearchPage}
                  type="button"
                  onClick={toggleSearchPage}
                >
                  <I name="search" size={20} stroke={1.7}/>
                </button>
              </div>
          <h1 className="stream-title">点滴</h1>
              <div className="stream-header-side"/>
            </>
          )}
        </div>
        ) : null}
        <div
          className={
            'suiji-stream'
            + (recordLifeMode === '育儿' && !isSearchActive && babyDiscoverVisible && !babyFeedingEntryActive ? ' has-baby-discover' : '')
            + (showDockQuickStrip ? ' has-dock-quick-strip' : '')
            + (focusedInputPathsDemo ? ' is-focused-input-flow' : '')
          }
          ref={streamRef}
        >

          {scene.record.showHealthCard && (
            <div className="stream-health">
              <HealthCard scene={sceneForHealth}/>
            </div>
          )}

          {isSearchActive && searchResultCount === 0 ? (
            <div className="tl-search-empty" role="status">
              <span className="tl-search-empty-ico" aria-hidden="true">
                <I name="search" size={44} stroke={1.4}/>
              </span>
              <p className="tl-search-empty-title">无结果</p>
              <p className="tl-search-empty-desc">检查拼写或尝试新搜索词。</p>
            </div>
          ) : (
          <TimelineStream
            blocks={displayTimeline}
            endRef={timelineEndRef}
            sisterPlayAnimation={sisterPlayAnimation}
            sisterCycleDone={sisterCycleDone}
            hideTodayGuide={!showTodayGuide}
            hideBabyFeeding={recordLifeMode === '经期'}
            onSisterCycleComplete={handleSisterCycleComplete}
            firstDropAnim={recordFeedback ? firstDropAnim : null}
            onFirstDropLand={recordFeedback ? handleFirstDropLand : undefined}
            onFirstDropComplete={recordFeedback ? handleFirstDropComplete : undefined}
          />
          )}
        </div>

        {!voiceTranscribe && (
        <DockPublisher
          draft={draft}
          onDraft={setDraft}
          onSend={()=>submitText()}
          onQuickMark={submitQuickMark}
          onMoodConfirm={submitMoodRecord}
          onSymptomConfirm={submitSymptomRecord}
          onWeightConfirm={submitWeightRecord}
          onFoodConfirm={submitFoodRecord}
          onDietCapture={submitDietCapture}
          onCameraRecord={submitCameraRecord}
          onVoiceDone={recordLifeMode === '育儿' ? submitBabyFeedingVoice : submitVoice}
          onPhoto={()=>setShowPhoto(true)}
          onDockExpandedChange={setDockExpanded}
          activeTab={activeTab}
          defaultInputMode="voice"
          hideQuickFan={showBabyFeedingQuickStrip}
          hideQuickFab={showPeriodQuickStrip}
          feedingQuickItems={dockQuickItems}
          feedingQuickLabel={showPeriodQuickStrip ? '经期快捷记录' : '宝宝喂养快捷记录'}
          onFeedingQuickSelect={showPeriodQuickStrip ? handlePeriodDockQuickSelect : handleBabyFeedingQuickSelect}
          onPeriodFeelSelect={()=>{
            setPeriodFeelGuideVisible(false);
            setPeriodFeelReady(false);
            setPeriodFeelModalOpen(true);
          }}
          periodFeelLabel="经期感受"
          periodFeelGuide={periodFeelGuideVisible}
          periodFeelGuideText="血量变化、经期症状，都能帮你快速记下来，立刻试试吧"
          demoPhase={demoPhase}
          isDemoRunning={isDemoRunning}
          structuredVoiceDemo={new URLSearchParams(window.location.search).get('demo') === 'structured-timeline-v2'}
          focusedInputDemo={focusedInputDemo}
          focusedLegacyVoiceDemo={focusedInputPathsDemo}
          onPeriodStartQuick={submitFocusedPeriodRecord}
        />
        )}
        {babyFeedingPanelMode && XhsStyleSearchPage ? (
          <XhsStyleSearchPage
            intent={babyFeedingPanelMode}
            variant="baby-feeding"
            activeFilter={searchCriteria?.personPanelFilter}
            onClose={closeBabyFeedingPanel}
            onSearch={handleTimelineSearch}
            onFilterSelect={handleBabyFeedingFilterSelect}
            onFilterClear={handleBabyFeedingFilterClear}
          />
        ) : null}
        {showSearchPage && !showBabyFeedingHeader && StreamSearchOverlay ? (
          <StreamSearchOverlay
            timeline={timeline}
            onClose={closeSearchPage}
            onSearch={handleTimelineSearch}
            onSearchClear={handleTimelineSearchClear}
            onDateSelect={handleTimelineDateSelect}
          />
        ) : null}
        </>
        )}
      </div>

      {showRecordShell && !showRecordEmpty && !showRecordBlank && recordLifeMode === '育儿' && !isSearchActive && babyDiscoverVisible && !babyFeedingEntryActive && (
        <BabyFeedingDiscoverCard onClose={closeBabyFeedingDiscoverCard}/>
      )}

      {voiceTranscribe && showRecordShell && !showRecordEmpty && !showRecordBlank && VoiceTranscribeInputLayer && (
        <VoiceTranscribeInputLayer
          variant={scene.voiceVariant}
          timeline={timeline}
          setTimeline={setTimeline}
          onScrollEnd={()=>scrollTimelineToBottom('smooth')}
          onRecorded={markUserRecorded}
        />
      )}

      {showPhoto && <PhotoSheet onCancel={()=>setShowPhoto(false)} onPick={submitPhoto}/>}

      <PeriodFeelOverlay
        open={periodFeelModalOpen && showRecordShell}
        label="记录经期感受"
        onClose={()=>setPeriodFeelModalOpen(false)}
          onComplete={(text)=>{
          setPeriodFeelRecorded(true);
          setPeriodFeelReady(false);
          setPeriodFeelGuideVisible(false);
          const entry = buildTimelineEntry(text, [], {
            voice:{duration:'10″'},
            tagLayout:'v3',
            tags:[{cat:'流量'},{cat:'心情'},{cat:'症状'}],
          });
          setTimeline(blocks=>{
            const dayId = blocks.find(b=>b.type==='day' && b.isToday)?.id;
            return window.appendTimelineEntry(blocks, entry, {dayId});
          });
          setPeriodFeelModalOpen(false);
          setTimeout(()=>scrollTimelineToBottom('smooth'), 100);
        }}
      />

      <Toast toasts={toasts}/>
      {showBottomTabBar && (
        <TabBar
          active={activeTab}
          onChange={handleTabChange}
          noteUnread={noteTabUnread}
          noteLabel="点滴"
          onNoteVoiceStart={recordLifeMode === '育儿' ? startBabyVoiceHold : undefined}
          onNoteVoiceMove={recordLifeMode === '育儿' ? moveBabyVoiceHold : undefined}
          onNoteVoiceEnd={recordLifeMode === '育儿' ? endBabyVoiceHold : undefined}
        />
      )}
      {recordLifeMode === '育儿' && (
        <BabyVoiceOverlay session={babyVoiceSession} success={babyVoiceSuccess}/>
      )}
      </div>

      {!window.__STANDALONE_LOCKED_SCENE && (
        <div className="demo-controls-stack">
          <DemoSceneBar
            value={t.demoScene}
            onChange={(v)=>setTweak('demoScene', v)}
            description={scene.description}
          />
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
