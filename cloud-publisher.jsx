// ============ 底部 Dock — 输入栏 + 右下悬浮快捷发布 ============

function UnifiedQuickIcon({type}){
  const key = type === 'period-feel' ? 'menses' : type;
  const colors = {
    menses:['#ff8fb4','#ff5f8f','#ff3d7a'], weight:['#c5a3f8','#ac78f3','#9b5ef0'],
    symptom:['#8fcdff','#4fb0f7','#2e9bf0'], mood:['#ffeb93','#ffd849','#ffc700'],
    diet:['#ffb68e','#ff7d47','#ff5f22'], water:['#8fe8c4','#34cf99','#16b981'],
  }[key] || ['#c9c9cf','#aaaab0','#888990'];
  const id = 'quick-' + key;
  const body = {
    menses:<><path d="M32 11.5c8.8 9.9 15 17.6 15 24.8A15 15 0 0 1 17 36.3c0-7.2 6.2-14.9 15-24.8z" fill={'url(#b-'+id+')'}/><g stroke="#fff" strokeLinecap="round" fill="none" opacity=".72"><path d="M25.4 33.6v6.4" strokeWidth="3.1"/><path d="M32 29.6v14.6" strokeWidth="3.4"/><path d="M38.6 32.4v8.8" strokeWidth="3.1"/></g><ellipse cx="25.8" cy="25.4" rx="3.4" ry="5.2" fill={'url(#h-'+id+')'} transform="rotate(-28 25.8 25.4)"/></>,
    weight:<><rect x="10" y="24" width="44" height="27" rx="10" fill={'url(#b-'+id+')'}/><path d="M21 42a11 11 0 0 1 22 0z" fill="#fff" opacity=".85"/><path d="M32 42l6.2-7.2" stroke="#7b3fd6" strokeWidth="2.6" strokeLinecap="round"/><circle cx="32" cy="42" r="1.9" fill="#7b3fd6"/></>,
    symptom:<><path d="M26 16h12a5 5 0 0 1 5 5v3H21v-3a5 5 0 0 1 5-5z" fill={'url(#b-'+id+')'} opacity=".85"/><rect x="11" y="22" width="42" height="30" rx="10" fill={'url(#b-'+id+')'}/><g fill="#fff" opacity=".92"><rect x="28.6" y="29" width="6.8" height="16" rx="3.4"/><rect x="24" y="33.6" width="16" height="6.8" rx="3.4"/></g></>,
    mood:<><circle cx="32" cy="33" r="20" fill={'url(#b-'+id+')'}/><g fill="#c98600"><ellipse cx="25" cy="29.5" rx="2.7" ry="3.4"/><ellipse cx="39" cy="29.5" rx="2.7" ry="3.4"/></g><path d="M24.5 38.5c2 3.4 4.6 5.1 7.5 5.1s5.5-1.7 7.5-5.1" stroke="#c98600" strokeWidth="3.2" strokeLinecap="round" fill="none"/></>,
    diet:<><g fill="#fff4e6"><rect x="33" y="35" width="20" height="8.6" rx="4.3" transform="rotate(42 33 35)"/><circle cx="46.5" cy="47.5" r="5.4"/><circle cx="50.5" cy="43.5" r="4.6"/></g><path d="M17.6 17.4c7-6.4 17.4-5.6 22.4.6s4.2 15.4-2.4 21-16.6 5.4-21.4-1.2-5.6-14 1.4-20.4z" fill={'url(#b-'+id+')'}/></>,
    water:<><path d="M18.5 17h27a2 2 0 0 1 2 2.2l-3.1 28.4A6.5 6.5 0 0 1 38 53.4H26a6.5 6.5 0 0 1-6.4-5.8L16.5 19.2a2 2 0 0 1 2-2.2z" fill={'url(#g-'+id+')'}/><path d="M21 31.5h22l-1.8 16.1a6.5 6.5 0 0 1-6.4 5.8H29.2a6.5 6.5 0 0 1-6.4-5.8z" fill={'url(#b-'+id+')'}/></>,
  }[key];
  return <svg className="dock-unified-quick-icon" viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><defs><linearGradient id={'b-'+id} x1="24%" y1="4%" x2="78%" y2="96%"><stop stopColor={colors[0]}/><stop offset=".52" stopColor={colors[1]}/><stop offset="1" stopColor={colors[2]}/></linearGradient><linearGradient id={'g-'+id} x1="20%" y1="0%" x2="85%" y2="100%"><stop stopColor={colors[0]} stopOpacity=".55"/><stop offset="1" stopColor={colors[1]} stopOpacity=".38"/></linearGradient><radialGradient id={'h-'+id}><stop stopColor="#fff" stopOpacity=".95"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs><circle cx="32" cy="32" r="32" fill="#fff"/><ellipse cx="32" cy="54" rx="15" ry="4.6" fill={colors[2]} opacity=".2"/>{body}</svg>;
}

/** 圆形语音图标（含音波弧线 — 参考附件还原） */
function DockVoiceCircleIco({size=22}){
  /* 三段同心弧，从左侧发射点向右辐射，粗描边 */
  const sw = 3.2;
  return (
    <svg viewBox="0 0 48 48" fill="none" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.8"/>
      {/* 最小弧 r=5 */}
      <path d="M21.5 19.5 A6 6 0 0 1 21.5 28.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" fill="none"/>
      {/* 中弧 r=9 */}
      <path d="M24 15.5 A10 10 0 0 1 24 32.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" fill="none"/>
      {/* 大弧 r=13 */}
      <path d="M26.5 12 A14 14 0 0 1 26.5 36" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/** 圆形键盘图标（含圆点键位 + 空格条） */
function DockKbdCircleIco({size=22}){
  const R = 2.3;
  const row1 = [12,16.5,21,25.5,30,34.5];
  const row2 = [14.5,19,23.5,28,32.5];
  return (
    <svg viewBox="0 0 48 48" fill="none" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="21.5" stroke="currentColor" strokeWidth="2.6"/>
      {row1.map(x=><circle key={x} cx={x} cy={18} r={R} fill="currentColor"/>)}
      {row2.map(x=><circle key={x} cx={x} cy={24.5} r={R} fill="currentColor"/>)}
      <rect x="15" y="29.5" width="18" height="3.5" rx="1.75" fill="currentColor"/>
    </svg>
  );
}

/** 方案 I · 卡片扇 — 4 项快捷发布
 *  布局：以加号为圆心，开口朝左上的 1/4 扇形，
 *  4 项按数组顺序均匀落在 -180°(左) → -90°(上) 区间，间隔 30°。
 *  角度约定：0° 朝右、逆时针为正（数学惯例），故 -180° 即 180°、-90° 即 90°。
 */
const QUICK_CARDS = [
  { id:'weight', label:'体重', hint:'±0.1 kg', title:'今日体重' },
  { id:'symptom', label:'症状', hint:'快速多选', title:'今日症状' },
  { id:'mood', label:'心情', hint:'5 档表情', title:'记录心情' },
  { id:'diet', label:'饮食', hint:'餐食速记', title:'今日饮食' },
];

const RADIAL_MENU = {
  stagger: 0.04,
  duration: 0.5,
  positions: [
    { x: -5, y: -158 },
    { x: -79.5, y: -136 },
    { x: -137, y: -79 },
    { x: -159, y: -4 },
  ],
};

function computeRadialCards(cards, config = RADIAL_MENU){
  const { positions = [], stagger: STAG } = config;
  return cards.map((card, i)=>{
    const pos = positions[i] || { x: 0, y: 0 };
    return {
      ...card,
      x: pos.x.toFixed(1),
      y: pos.y.toFixed(1),
      dOut: (i * STAG).toFixed(3) + 's',
      dIn: ((cards.length - 1 - i) * STAG).toFixed(3) + 's',
    };
  });
}

const QUICK_CARDS_RADIAL = computeRadialCards(QUICK_CARDS);

const DEMO_VOICE_LINE = '昨天下午来了姨妈，来之前，上午就开始头痛。';

const DOCK_PLACEHOLDER = '记录生活点滴';

function DockWavePlaceholder({show, focused, text = DOCK_PLACEHOLDER}){
  if(!show) return null;

  return (
    <span
      className={'dock-float-ph'+(focused ? ' is-focused' : '')}
      aria-hidden="true"
    >
      <span className="dock-float-ph-char is-idle">{text}</span>
    </span>
  );
}

function QuickCardFan({
  open, selected, closingToMood, onFabTap, onSelectCard, onMoodPick, onSymptomPick, onDietPick, onClose,
  onSymptomSubmit, onWeightSubmit, onFoodSubmit, weightPickerKey, fabGuidePulse = false, hideFab = false,
}){
  const QuickCardIcon = window.QuickCardIcon;
  const QuickSymptomPicker = window.QuickSymptomPicker;
  const QuickWeightPicker = window.QuickWeightPicker;
  const QuickFoodPicker = window.QuickFoodPicker;
  const [closing, setClosing] = React.useState(false);
  const wasOpenRef = React.useRef(false);

  React.useEffect(()=>{
    if(open){
      setClosing(false);
      wasOpenRef.current = true;
      return;
    }
    if(!wasOpenRef.current || selected) return;
    setClosing(true);
    const dur = closingToMood
      ? 0.22
      : RADIAL_MENU.duration * 0.8 + (QUICK_CARDS.length - 1) * RADIAL_MENU.stagger;
    const tm = setTimeout(()=>{
      setClosing(false);
      wasOpenRef.current = false;
    }, dur * 1000 + 80);
    return ()=>clearTimeout(tm);
  }, [open, selected, closingToMood]);

  const fanClosing = closing || (closingToMood && !open);

  return (
    <div
      className={'quick-card-fan'
        +(open ? ' is-open' : '')
        +(fanClosing ? ' is-closing' : '')
        +(closingToMood ? ' to-mood' : '')
        +(selected ? ' has-selected' : '')}
      style={{'--rm-duration': RADIAL_MENU.duration + 's'}}
    >
      {QUICK_CARDS_RADIAL.map((card)=>{
        const isSel = selected === card.id;
        const isOther = selected && !isSel;

        return (
          <div
            key={card.id}
            className={'quick-card-fan-item'
              +(isSel ? ' is-selected' : '')
              +(isOther ? ' is-faded' : '')}
            data-card={card.id}
            style={{
              '--x': card.x + 'px',
              '--y': card.y + 'px',
              '--d-out': card.dOut,
              '--d-in': card.dIn,
            }}
          >
            <button
              type="button"
              className="quick-card-fan-face"
              onPointerDown={(e)=>{
                if(!open || selected) return;
                if(card.id === 'diet'){
                  e.preventDefault();
                  e.stopPropagation();
                  onDietPick?.(e.currentTarget);
                } else if(card.id === 'mood'){
                  e.preventDefault();
                  e.stopPropagation();
                  onMoodPick?.();
                } else if(card.id === 'symptom'){
                  e.preventDefault();
                  e.stopPropagation();
                  onSymptomPick?.();
                }
              }}
              onClick={()=>{
                if(!open || selected) return;
                if(card.id !== 'mood' && card.id !== 'diet' && card.id !== 'symptom') onSelectCard(card.id);
              }}
              aria-label={card.label}
              tabIndex={open && !selected ? 0 : -1}
            >
              <span className="quick-card-fan-ico">
                <QuickCardIcon kind={card.id} size={24}/>
              </span>
              <span className="quick-card-fan-lbl">{card.label}</span>
            </button>

            <div className="quick-card-fan-panel" aria-hidden={!isSel}>
              {card.id !== 'weight' ? (
                <div className="quick-card-fan-panel-hd">
                  <span className="quick-card-fan-panel-title">{card.title}</span>
                  <button type="button" className="quick-card-fan-panel-close" onClick={onClose} aria-label="关闭">
                    ×
                  </button>
                </div>
              ) : null}
              <div className={'quick-card-fan-panel-body'+(card.id === 'weight' ? ' is-weight' : '')}>
                {card.id === 'symptom' ? (
                  <QuickSymptomPicker onSubmit={onSymptomSubmit}/>
                ) : card.id === 'diet' ? (
                  <QuickFoodPicker onSubmit={onFoodSubmit}/>
                ) : card.id === 'weight' ? (
                  <QuickWeightPicker key={weightPickerKey} onSubmit={onWeightSubmit}/>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {!hideFab ? <button
        type="button"
        className={'quick-card-fab'+(open ? ' is-open' : '')+(selected ? ' is-covered' : '')+(fabGuidePulse ? ' is-guide-pulse' : '')}
        onClick={onFabTap}
        aria-expanded={open}
        aria-label={open ? '收起快捷记录' : '快捷记录'}
      >
        {fabGuidePulse ? <span className="quick-card-fab-pulse-ring" aria-hidden="true"/> : null}
        <span className="quick-card-fab-gray" aria-hidden="true"/>
        <span className="quick-card-fab-plus" aria-hidden="true"/>
      </button> : null}
    </div>
  );
}

function BeverageQuickSheet({onClose, onPhoto, onWater}){
  const I = window.Icon;
  return (
    <div className="dock-sheet dock-beverage-sheet">
      <div className="dock-sheet-hd">
        <h3 className="dock-sheet-title">记录喝水</h3>
        <button type="button" className="dock-sheet-close" onClick={onClose} aria-label="关闭">
          <I name="x" size={20} stroke={1.8}/>
        </button>
      </div>
      <div className="dock-beverage-actions">
        <button type="button" className="dock-beverage-action" onClick={(event)=>onPhoto?.(event.currentTarget)}>
          <span className="dock-beverage-action-icon is-photo" aria-hidden="true">
            <I name="camera" size={25} stroke={1.8}/>
          </span>
          <span>
            <strong>拍照记录</strong>
            <small>识别奶茶、咖啡标签分析热量、咖啡因</small>
          </span>
          <I name="chevron-right" size={18} stroke={1.8}/>
        </button>
        <button type="button" className="dock-beverage-action" onClick={onWater}>
          <span className="dock-beverage-action-icon is-water" aria-hidden="true">
            <img src="assets/baby-feeding-icons/water.png" alt=""/>
          </span>
          <span>
            <strong>输入记录</strong>
            <small>记录饮水、饮品信息统计每日饮水量</small>
          </span>
          <I name="chevron-right" size={18} stroke={1.8}/>
        </button>
      </div>
    </div>
  );
}

function WaterQuickSheet({onClose, onSave}){
  const I = window.Icon;
  const categories = ['水', '奶茶', '咖啡', '果茶', '纯茶', '果汁', '果蔬汁', '纯奶饮品', '饮料', '其他'];
  const nutritionPer500 = {
    奶茶:[420, 60], 咖啡:[120, 95], 果茶:[220, 20], 纯茶:[20, 35],
    果汁:[230, 0], 果蔬汁:[180, 0], 纯奶饮品:[280, 0], 饮料:[190, 0], 其他:[160, 0],
  };
  const [category, setCategory] = React.useState('水');
  const [capacityMl, setCapacityMl] = React.useState(300);
  const [brand, setBrand] = React.useState('');
  const [beverageName, setBeverageName] = React.useState('');
  const isWater = category === '水';
  const nutrition = nutritionPer500[category] || [0, 0];
  const calories = isWater ? 0 : Math.round(nutrition[0] * capacityMl / 500);
  const caffeineMg = isWater ? 0 : Math.round(nutrition[1] * capacityMl / 500);
  const submit = ()=>onSave({
    beverageCategory:category,
    capacityMl,
    brand:isWater ? '' : brand.trim(),
    beverageName:isWater ? '白水' : beverageName.trim(),
    iceLevel:'',
    sugarLevel:'',
    calories,
    caffeineMg,
  });
  return (
    <div className="dock-sheet dock-water-sheet dock-water-entry-sheet">
      <div className="dock-sheet-hd">
        <h3 className="dock-sheet-title">记录喝水</h3>
        <button type="button" className="dock-sheet-close" onClick={onClose} aria-label="关闭">
          <I name="x" size={20} stroke={1.8}/>
        </button>
      </div>
      <div className="dock-water-entry-scroll">
        <section className="dock-water-entry-card">
          <label className="dock-water-entry-label">品类</label>
          <div className="dock-water-category-scroll" role="group" aria-label="喝水品类">
            {categories.map(option=>(
              <button
                type="button"
                className={category === option ? 'is-active' : ''}
                key={option}
                onClick={()=>setCategory(option)}
                aria-pressed={category === option}
              >
                {option}
              </button>
            ))}
          </div>

          {!isWater ? (
            <div className="dock-water-entry-fields">
              <label>
                <span>品牌</span>
                <input value={brand} onChange={(event)=>setBrand(event.target.value)} placeholder="例如：星巴克"/>
              </label>
              <label>
                <span>饮品名称</span>
                <input value={beverageName} onChange={(event)=>setBeverageName(event.target.value)} placeholder="例如：红茶咖啡拿铁鸳鸯"/>
              </label>
            </div>
          ) : null}

          <div className="dock-water-capacity">
            <div>
              <span>容量</span>
              <strong>{capacityMl} ml</strong>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={capacityMl}
              onChange={(event)=>setCapacityMl(Number(event.target.value))}
              aria-label="饮品容量"
            />
            <div className="dock-water-capacity-labels">
              <span>100</span><span>300</span><span>500</span><span>750</span><span>1000ml</span>
            </div>
          </div>

          {!isWater ? (
            <div className="dock-water-nutrition-readonly" aria-label="按容量估算的饮品信息">
              <div><span>热量</span><strong>{calories}</strong><i>千卡</i></div>
              <div><span>咖啡因</span><strong>{caffeineMg}</strong><i>毫克</i></div>
              <p>热量与咖啡因随容量自动估算</p>
            </div>
          ) : null}
        </section>
      </div>
      <div className="dock-sheet-foot">
        <button type="button" className="dock-sheet-submit" onClick={submit}>保存记录</button>
      </div>
    </div>
  );
}

function DockPublisher({
  draft, onDraft, onSend, onQuickMark, onMoodConfirm, onSymptomConfirm, onWeightConfirm,
  onFoodConfirm, onDietCapture, onCameraRecord,
  onVoiceDone, onPhoto, onDockExpandedChange, onCameraActiveChange, activeTab, showScheme3Bubble,
  highlightScheme3Input, dockPlaceholder, defaultInputMode = 'voice',
  demoPhase, isDemoRunning, hideQuickFan = false, hideQuickFab = false,
  feedingQuickItems = null, feedingQuickLabel = '快捷记录', onFeedingQuickSelect,
  onPeriodFeelSelect, onVoiceStart,
  periodFeelLabel = '经期感受', periodFeelGuide = false,
  periodFeelGuideText = '这次经期有什么特别的感受么？试试把它记录下来',
  emptyPreviewGuideStep = 0, onEmptyPreviewGuideAdvance, onEmptyPreviewGuideDismiss, fabGuidePulse = false,
}){
  const I = window.Icon;
  const DockMoodPicker = window.DockMoodPicker;
  const DockSymptomPicker = window.DockSymptomPicker;
  const CameraTransition = window.CameraTransition;
  const QuickCardIcon = window.QuickCardIcon;
  const measureElementRect = window.measureElementRect;
  const [inputMode, setInputMode] = React.useState(defaultInputMode);
  const [quickOpen, setQuickOpen] = React.useState(false);
  const [quickSelected, setQuickSelected] = React.useState(null);
  const [closingToMood, setClosingToMood] = React.useState(false);
  const [moodPickerOpen, setMoodPickerOpen] = React.useState(false);
  const [symptomPickerOpen, setSymptomPickerOpen] = React.useState(false);
  const [dockSheet, setDockSheet] = React.useState(null);
  const [recording, setRecording] = React.useState(false);
  const [recSec, setRecSec] = React.useState(0);
  const [inputFocused, setInputFocused] = React.useState(false);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [cameraSourceRect, setCameraSourceRect] = React.useState(null);
  const [cameraPreferredMode, setCameraPreferredMode] = React.useState(null);
  // 输入框相册：相机按钮 → 拍照 / 选择图片 菜单 → 拍照页 / 全屏相册；已选照片最多 9 张
  const PHOTO_LIMIT = 9;
  const [photoMenuRect, setPhotoMenuRect] = React.useState(null);
  const photoMenuOpen = !!photoMenuRect;
  const gallerySnapshotRef = React.useRef(null);
  const textAreaRef = React.useRef(null);
  const [galleryFullScreen, setGalleryFullScreen] = React.useState(false);
  const [recordCameraOpen, setRecordCameraOpen] = React.useState(false);
  const [dockKeyboardOpen, setDockKeyboardOpen] = React.useState(false);
  const [selectedPhotos, setSelectedPhotos] = React.useState([]);
  // 键盘态点输入框外：输入框收回初始态（照片行隐藏、快捷栏回来），照片仍记着；再点输入框时恢复
  const [photosCollapsed, setPhotosCollapsed] = React.useState(false);
  const showPhotoRow = selectedPhotos.length > 0 && !photosCollapsed;
  const [feedingExpanded, setFeedingExpanded] = React.useState(false);
  const recTimer = React.useRef(null);
  const prevTabRef = React.useRef(activeTab);
  const containerRef = React.useRef(null);
  const feedingDragStartY = React.useRef(null);

  const galleryPhotos = React.useMemo(()=>([
    'IMG_9145_2-72cf62bb-2ea4-45fa-977a-78f80ac3da58.png',
    'IMG_9137-a082d61f-1417-483d-9122-37c8ebcb2861.png',
    'IMG_9128-7218d6e2-498b-4980-8a99-218909c9881d.png',
    'IMG_9127-d09a43af-ea30-4eea-b165-d501765c5244.png',
    'IMG_9140-a0794273-c982-414f-8516-52af2c4456e1.png',
    'IMG_9129-0b57a26b-182e-49cc-ad71-7b972274a436.png',
    'IMG_9130-49592824-80e2-4ef5-a0c4-d094130b01d4.png',
    'IMG_9144-803d342e-cc05-4834-943e-4c52e0bad0d3.png',
    'IMG_9139-a36f2639-6b62-453c-bdc1-2d7cd67b4d28.png',
    '1779691515990-7a645e8f-02b5-44f1-8fe5-7c60f1f4cc40.png',
  ]).map((file, index)=>({
    id:'gallery-'+index,
    src:'assets/gallery/'+file,
    alt:'相册照片 '+(index + 1),
  })), []);

  React.useEffect(()=>{
    if(containerRef.current){
      const phone = containerRef.current.closest('.phone');
      if(phone) containerRef.current = phone;
    }
  }, []);

  React.useEffect(()=>{
    setInputMode(defaultInputMode);
  }, [defaultInputMode]);

  React.useEffect(()=>{
    if(activeTab === 'note' && prevTabRef.current !== 'note'){
      setQuickOpen(false);
      setQuickSelected(null);
      setDockSheet(null);
      setMoodPickerOpen(false);
      setSymptomPickerOpen(false);
      setClosingToMood(false);
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  React.useEffect(()=>{
    if(!showScheme3Bubble) return;
    const tm = setTimeout(()=>window.markScheme3BubbleSeen?.(), 2400);
    return ()=>clearTimeout(tm);
  }, [showScheme3Bubble]);

  const [weightPickerKey, setWeightPickerKey] = React.useState(0);

  const handleSelectQuickCard = (id)=>{
    if(id === 'weight') setWeightPickerKey(k=>k + 1);
    setQuickSelected(id);
  };

  const closeQuick = ()=>{
    setQuickSelected(null);
    setQuickOpen(false);
    setClosingToMood(false);
  };

  const handleMoodFanTap = ()=>{
    setMoodPickerOpen(true);
    setClosingToMood(true);
    setQuickOpen(false);
    window.setTimeout(()=> setClosingToMood(false), 260);
  };

  const closeMoodPicker = ()=>{
    setMoodPickerOpen(false);
    setClosingToMood(false);
  };

  const handleMoodOverlaySubmit = (moods)=>{
    setMoodPickerOpen(false);
    setClosingToMood(false);
    setQuickOpen(false);
    setQuickSelected(null);
    onMoodConfirm?.(moods);
  };

  const handleSymptomFanTap = ()=>{
    setSymptomPickerOpen(true);
    setClosingToMood(true);
    setQuickOpen(false);
    window.setTimeout(()=> setClosingToMood(false), 260);
  };

  const closeSymptomPicker = ()=>{
    setSymptomPickerOpen(false);
    setClosingToMood(false);
  };

  const handleSymptomOverlaySubmit = (symptoms)=>{
    setSymptomPickerOpen(false);
    setClosingToMood(false);
    setQuickOpen(false);
    setQuickSelected(null);
    onSymptomConfirm?.(symptoms);
  };

  const handleFabTap = ()=>{
    if(emptyPreviewGuideStep === 2) onEmptyPreviewGuideAdvance?.();
    if(quickOpen) closeQuick();
    else setQuickOpen(true);
  };

  const notifyGuideDockInteract = ()=>{
    if(emptyPreviewGuideStep === 1) onEmptyPreviewGuideAdvance?.();
  };

  const dismissGuideForVoice = ()=>{
    if(emptyPreviewGuideStep === 1 || emptyPreviewGuideStep === 2) onEmptyPreviewGuideDismiss?.();
  };


  React.useEffect(()=>{
    if(recording){
      recTimer.current = setInterval(()=>setRecSec(s=>s+1), 1000);
    } else {
      clearInterval(recTimer.current);
      setRecSec(0);
    }
    return ()=>clearInterval(recTimer.current);
  }, [recording]);

  const startRec = ()=>{ setRecording(true); onVoiceStart?.(); };
  const stopRec = ()=>{
    if(!recording) return;
    setRecording(false);
    onVoiceDone(DEMO_VOICE_LINE, Math.max(recSec, 3));
  };

  const toggleMode = ()=>{
    setInputMode(m=>m==='text' ? 'voice' : 'text');
    closeQuick();
  };

  const togglePhotoMenu = (buttonEl)=>{
    if(photoMenuOpen){ setPhotoMenuRect(null); return; }
    setInputMode('text');
    setQuickOpen(false);
    setQuickSelected(null);
    setDockSheet(null);
    document.activeElement?.blur?.();
    const r = buttonEl.getBoundingClientRect();
    const phoneRect = buttonEl.closest('.phone')?.getBoundingClientRect() || { left:0, right:window.innerWidth };
    const MENU_W = 168;
    const left = Math.max(phoneRect.left + 12, Math.min(r.left, phoneRect.right - 12 - MENU_W));
    // 菜单浮在整个输入框上方，不遮挡输入区
    const anchorTop = (buttonEl.closest('.dock-composer-stack') || buttonEl).getBoundingClientRect().top;
    setPhotoMenuRect({ left, bottom: window.innerHeight - anchorTop });
  };

  const openPhotoCamera = ()=>{
    setPhotoMenuRect(null);
    setRecordCameraOpen(true);
  };

  const openPhotoAlbum = ()=>{
    setPhotoMenuRect(null);
    gallerySnapshotRef.current = selectedPhotos;
    setGalleryFullScreen(true);
  };

  const cancelPhotoAlbum = ()=>{
    // 取消：撤销本次在相册里的勾选
    if(gallerySnapshotRef.current) setSelectedPhotos(gallerySnapshotRef.current);
    gallerySnapshotRef.current = null;
    setGalleryFullScreen(false);
  };

  // 拍照 / 选图回到点滴页：光标落在输入框，键盘展开
  const focusComposerAfterPhoto = ()=>{
    setInputMode('text');
    setPhotosCollapsed(false);
    setDockKeyboardOpen(true);
    setInputFocused(true);
    setTimeout(()=>{
      const el = textAreaRef.current;
      if(!el) return;
      el.focus({ preventScroll: true });
      const len = el.value.length;
      try{ el.setSelectionRange(len, len); }catch(_){}
    }, 60);
  };

  const finishPhotoAlbum = ()=>{
    gallerySnapshotRef.current = null;
    setGalleryFullScreen(false);
    if(selectedPhotos.length) focusComposerAfterPhoto();
  };

  const togglePhoto = (photo)=>{
    setSelectedPhotos(current=>{
      const exists = current.some(item=>item.id === photo.id);
      if(exists) return current.filter(item=>item.id !== photo.id);
      if(current.length >= PHOTO_LIMIT) return current;
      return [...current, photo];
    });
  };

  const sendGalleryRecord = ()=>{
    if(!draft.trim() && selectedPhotos.length === 0) return;
    // 键盘态下直接发送：发完再收起键盘，不再回到相册
    document.activeElement?.blur?.();
    onSend?.(selectedPhotos.map(({src, alt})=>({src, alt})));
    setSelectedPhotos([]);
    setPhotosCollapsed(false);
    setPhotoMenuRect(null);
    setGalleryFullScreen(false);
    setDockKeyboardOpen(false);
  };

  const captureRecordPhoto = (capture = {})=>{
    if(selectedPhotos.length >= PHOTO_LIMIT) return;
    const source = galleryPhotos[0];
    const captured = {
      ...source,
      id:'captured-'+Date.now(),
      alt:capture.mode === 'video' ? '刚刚录制的视频' : '刚刚拍摄的照片',
      videoDuration:capture.mode === 'video' ? capture.duration : null,
    };
    setSelectedPhotos(current=>[...current, captured].slice(0, PHOTO_LIMIT));
    setRecordCameraOpen(false);
    gallerySnapshotRef.current = null;
    setGalleryFullScreen(false);
    focusComposerAfterPhoto();
  };

  const closeDockSheet = ()=> setDockSheet(null);

  const handleQuickSymptomSubmit = (symptoms)=>{
    closeQuick();
    onSymptomConfirm?.(symptoms);
  };

  const handleQuickWeightSubmit = (payload)=>{
    closeQuick();
    onWeightConfirm?.(payload);
  };

  const handleQuickFoodSubmit = (foods)=>{
    closeQuick();
    onFoodConfirm?.(foods);
  };

  const handleMoodConfirm = (moods)=>{
    setDockSheet(null);
    onMoodConfirm?.(moods);
  };

  const handleSymptomConfirm = (symptoms)=>{
    setDockSheet(null);
    onSymptomConfirm?.(symptoms);
  };

  const openRecognitionCamera = (buttonEl, preferredMode = null)=>{
    if(!buttonEl) return;
    const phone = buttonEl.closest('.phone');
    if(!phone) return;
    containerRef.current = phone;
    const rect = measureElementRect?.(buttonEl, phone);
    setCameraSourceRect(rect);
    setCameraPreferredMode(preferredMode);
    setDockSheet(null);
    setQuickOpen(false);
    setQuickSelected(null);
    setCameraOpen(true);
  };

  const handleDietFanTap = (buttonEl)=>{
    openRecognitionCamera(buttonEl, 'diet');
  };

  const handleCameraCaptureSuccess = (payload)=>{
    const normalized = {
      ...payload,
      type: payload?.type || 'capture',
      photoUrl: payload?.photoUrl || null,
      photo: payload?.photo,
      recognitionState: 'ready',
    };
    if(normalized.mode === 'diet') onDietCapture?.(normalized);
    else onCameraRecord?.(normalized);
  };

  const handleCameraClose = ()=>{
    setCameraOpen(false);
    setCameraPreferredMode(null);
  };

  React.useEffect(()=>{
    onDockExpandedChange?.(!!dockSheet || !!quickSelected || photoMenuOpen || dockKeyboardOpen);
  }, [dockSheet, quickSelected, photoMenuOpen, dockKeyboardOpen, onDockExpandedChange]);

  React.useEffect(()=>{
    if(!dockSheet) return undefined;
    const handleOutsidePointerDown = (event)=>{
      if(event.target.closest?.('.dock-sheet')) return;
      closeDockSheet();
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return ()=>document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [dockSheet]);

  const isDockExpanded = !!dockSheet;
  const hidePhotoQuickStrip = photoMenuOpen || dockKeyboardOpen || showPhotoRow;
  React.useEffect(()=>{
    // 快捷栏被相册流程隐藏时，顺手收起展开态，避免回来时面板高度跳动
    if(hidePhotoQuickStrip && feedingExpanded) setFeedingExpanded(false);
  }, [hidePhotoQuickStrip, feedingExpanded]);
  const isQuickActive = quickOpen || !!quickSelected;
  const inputPlaceholder = dockPlaceholder || DOCK_PLACEHOLDER;
  const showFeedingQuick = Array.isArray(feedingQuickItems) && feedingQuickItems.length > 0;
  const feedingVisibleItems = showFeedingQuick && !feedingExpanded
    ? feedingQuickItems.slice(0, 6)
    : (feedingQuickItems || []);
  const MoodOverlay = window.MoodQuickOverlay || (()=>null);
  const SymptomOverlay = window.SymptomQuickOverlay || (()=>null);

  const galleryGrid = (fullScreen = false)=>(
    <div className={'record-gallery-grid'+(fullScreen ? ' is-fullscreen' : '')}>
      <button
        type="button"
        className={'record-gallery-camera-tile'+(selectedPhotos.length >= PHOTO_LIMIT ? ' is-limit-reached' : '')}
        onClick={()=>setRecordCameraOpen(true)}
        disabled={selectedPhotos.length >= PHOTO_LIMIT}
        aria-label="拍照"
      >
        <span className="record-gallery-camera-icon"><I name="camera" size={28} strokeWidth={1.8}/></span>
        <span>拍照</span>
      </button>
      {galleryPhotos.map(photo=>{
        const selectedIndex = selectedPhotos.findIndex(item=>item.id === photo.id);
        return (
          <button
            type="button"
            key={photo.id}
            className={'record-gallery-photo'+(selectedIndex >= 0 ? ' is-selected' : '')+(selectedPhotos.length >= PHOTO_LIMIT && selectedIndex < 0 ? ' is-limit-reached' : '')}
            onClick={()=>togglePhoto(photo)}
            disabled={selectedPhotos.length >= PHOTO_LIMIT && selectedIndex < 0}
            aria-label={(selectedIndex >= 0 ? '取消选择' : '选择')+photo.alt}
            aria-pressed={selectedIndex >= 0}
          >
            <img src={photo.src} alt=""/>
            <span className="record-gallery-check">{selectedIndex >= 0 ? selectedIndex + 1 : ''}</span>
          </button>
        );
      })}
    </div>
  );

  const startFeedingPanelDrag = (clientY)=>{
    if(!showFeedingQuick) return;
    feedingDragStartY.current = clientY;
  };

  const finishFeedingPanelDrag = (clientY)=>{
    if(!showFeedingQuick || feedingDragStartY.current == null) return;
    const dy = clientY - feedingDragStartY.current;
    feedingDragStartY.current = null;
    if(dy < -18) setFeedingExpanded(true);
    if(dy > 18) setFeedingExpanded(false);
  };

  const handleDockQuickItemSelect = (item, buttonEl)=>{
    if(item?.action === 'period-feel'){
      onPeriodFeelSelect?.();
      return;
    }
    if(item?.action === 'weight'){
      setWeightPickerKey(k=>k + 1);
      setQuickOpen(false);
      setQuickSelected('weight');
      return;
    }
    if(item?.action === 'symptom'){
      handleSymptomFanTap();
      return;
    }
    if(item?.action === 'mood'){
      handleMoodFanTap();
      return;
    }
    if(item?.action === 'diet'){
      openRecognitionCamera(buttonEl, 'diet');
      return;
    }
    if(item?.action === 'beverage'){
      setDockSheet('beverage');
      return;
    }
    onFeedingQuickSelect?.(item);
  };

  return (
    <>
      {!hideQuickFan && !hidePhotoQuickStrip && (
      <div className={'quick-float-wrap'+(isDockExpanded ? ' is-covered' : '')+(isQuickActive ? ' is-quick-active' : '')}>
        <QuickCardFan
          open={quickOpen}
          selected={quickSelected}
          closingToMood={closingToMood}
          onFabTap={handleFabTap}
          onSelectCard={handleSelectQuickCard}
          onMoodPick={handleMoodFanTap}
          onSymptomPick={handleSymptomFanTap}
          onDietPick={handleDietFanTap}
          onClose={closeQuick}
          onSymptomSubmit={handleQuickSymptomSubmit}
          onWeightSubmit={handleQuickWeightSubmit}
          onFoodSubmit={handleQuickFoodSubmit}
          weightPickerKey={weightPickerKey}
          fabGuidePulse={fabGuidePulse}
          hideFab={hideQuickFab}
        />
      </div>
      )}

      {CameraTransition && (
        <CameraTransition
          active={cameraOpen}
          sourceRect={cameraSourceRect}
          containerRef={containerRef}
          cardContent={
            <>
              <span className="quick-menu-item-icon">
                <I name="camera" size={22} stroke={1.7}/>
              </span>
              <span className="quick-menu-item-label">智能拍照</span>
            </>
          }
          onCaptureSuccess={handleCameraCaptureSuccess}
          onClose={handleCameraClose}
          onActiveChange={onCameraActiveChange}
          preferredRecognitionMode={cameraPreferredMode}
        />
      )}

      {ReactDOM.createPortal(
        <MoodOverlay
          open={moodPickerOpen}
          onSubmit={handleMoodOverlaySubmit}
          onClose={closeMoodPicker}
        />,
        document.body
      )}

      {photoMenuOpen && ReactDOM.createPortal(
        <div className="dock-photo-menu-layer" onPointerDown={(e)=>{ if(e.target === e.currentTarget) setPhotoMenuRect(null); }}>
          <div className="dock-photo-menu" role="menu" style={{left:photoMenuRect.left, bottom:photoMenuRect.bottom + 10}}>
            <button type="button" role="menuitem" onClick={openPhotoCamera} disabled={selectedPhotos.length >= PHOTO_LIMIT}>
              <I name="camera" size={20} strokeWidth={1.7}/>
              <span>拍照</span>
            </button>
            <button type="button" role="menuitem" onClick={openPhotoAlbum}>
              <I name="image" size={20} strokeWidth={1.7}/>
              <span>选择图片</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {galleryFullScreen && ReactDOM.createPortal(
        <div className="record-gallery-fullscreen" role="dialog" aria-modal="true" aria-label="相册">
          <div className="record-gallery-full-nav">
            <button type="button" onClick={cancelPhotoAlbum}>取消</button>
            <strong>相册</strong>
            <button type="button" className="is-done" onClick={finishPhotoAlbum}>
              完成{selectedPhotos.length ? `(${selectedPhotos.length})` : ''}
            </button>
          </div>
          <div className="record-gallery-full-body">{galleryGrid(true)}</div>
        </div>,
        document.body
      )}

      {recordCameraOpen && ReactDOM.createPortal(
        <RecordSystemCamera
          previewSrc={galleryPhotos[0].src}
          albumSrc={galleryPhotos[1].src}
          onClose={()=>setRecordCameraOpen(false)}
          onOpenAlbum={()=>{setRecordCameraOpen(false);openPhotoAlbum();}}
          onCapture={captureRecordPhoto}
        />,
        document.body
      )}

      {ReactDOM.createPortal(
        <SymptomOverlay
          open={symptomPickerOpen}
          onSubmit={handleSymptomOverlaySubmit}
          onClose={closeSymptomPicker}
        />,
        document.body
      )}

      <div className={'dock-wrap'+(isDockExpanded?' is-mood-expanded':'')+(showFeedingQuick?' is-feeding-dock':'')+(feedingExpanded?' is-feeding-expanded':'')+(dockKeyboardOpen?' is-gallery-open':'')}>
        <div
          className={'dock-panel'
            +(!dockSheet ? ' is-path-dock' : '')
            +(isDockExpanded?' is-mood-expanded':'')
            +(showFeedingQuick?' is-feeding-dock':'')
            +(feedingExpanded?' is-feeding-expanded':'')
            +(dockKeyboardOpen?' is-gallery-open':'')}
          onPointerDown={showFeedingQuick && !hidePhotoQuickStrip ? (e)=>startFeedingPanelDrag(e.clientY) : undefined}
          onPointerUp={showFeedingQuick && !hidePhotoQuickStrip ? (e)=>finishFeedingPanelDrag(e.clientY) : undefined}
          onPointerCancel={showFeedingQuick && !hidePhotoQuickStrip ? ()=>{ feedingDragStartY.current = null; } : undefined}
        >
          {dockSheet === 'mood' ? (
            <DockMoodPicker
              onConfirm={handleMoodConfirm}
              onCancel={closeDockSheet}
            />
          ) : dockSheet === 'symptom' ? (
            <DockSymptomPicker
              onConfirm={handleSymptomConfirm}
              onCancel={closeDockSheet}
            />
          ) : dockSheet === 'beverage' ? (
            <BeverageQuickSheet
              onClose={closeDockSheet}
              onPhoto={(buttonEl)=>openRecognitionCamera(buttonEl, 'beverage')}
              onWater={()=>setDockSheet('water')}
            />
          ) : dockSheet === 'water' ? (
            <WaterQuickSheet
              onClose={closeDockSheet}
              onSave={(record)=>{
                closeDockSheet();
                onCameraRecord?.({mode:'water', ...record, source:'quick'});
              }}
            />
          ) : (
          <div className={'dock-bar is-path-dock'+(showFeedingQuick ? ' has-feeding-quick' : '')+(dockKeyboardOpen ? ' has-record-gallery' : '')}>
            {showFeedingQuick && !hidePhotoQuickStrip ? (
              <div className="dock-feeding-quick" aria-label={feedingQuickLabel}>
                {periodFeelGuide && (
                  <div className="period-feel-guide-bubble" role="status">
                    {periodFeelGuideText}
                    <span className="period-feel-guide-arrow" aria-hidden="true" />
                  </div>
                )}
                <button
                  type="button"
                  className="dock-feeding-handle"
                  aria-label={feedingExpanded ? '收起快捷记录面板' : '展开快捷记录面板'}
                  aria-expanded={feedingExpanded}
                  onClick={()=>setFeedingExpanded(v=>!v)}
                >
                  <span/>
                </button>
                <div className="dock-feeding-quick-scroll">
                  {feedingVisibleItems.map((item)=>(
                    <button
                      key={item.id}
                      type="button"
                      className={'dock-feeding-quick-item'+(item.id === 'period-feel' ? ' is-period-feel-enter' : '')+(item.drop ? ' is-period-feel-drop' : '')+(item.plan3Shift ? ' is-period-feel-plan3-shift' : '')+(item.pulse ? ' is-period-feel-pulse' : '')}
                      onClick={(event)=>handleDockQuickItemSelect(item, event.currentTarget)}
                    >
                      <span className="dock-feeding-quick-icon" aria-hidden="true">
                        {item.iconNode || item.icon || '🍼'}
                      </span>
                      <span className="dock-feeding-quick-label">{item.id === 'period-feel' ? periodFeelLabel : item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className={'dock-composer-stack'+(showPhotoRow ? ' has-photo-content' : '')}>
            <div className={'dock-input-row dock-input-pill'+(showPhotoRow ? ' has-photo-content' : '')}>
              <button
                type="button"
                className="dock-mode-btn"
                onClick={()=>{
                  notifyGuideDockInteract();
                  toggleMode();
                }}
                aria-label={inputMode==='text'?'切换语音':'切换键盘'}
              >
                {inputMode==='text'
                  ? <DockVoiceCircleIco size={26}/>
                  : <DockKbdCircleIco size={26}/>}
              </button>

              {inputMode==='text' ? (
                <div className={'dock-text-field'
                  +(inputFocused?' is-focused':'')
                  +(highlightScheme3Input?' is-scheme3-highlight':'')}>
                  {showScheme3Bubble && !draft.trim() && !inputFocused ? (
                    <span className="dock-scheme3-bubble" aria-hidden="true">
                      ✏️ 记下第一刻
                    </span>
                  ) : null}
                  <DockWavePlaceholder
                    show={inputMode === 'text' && !draft.trim() && !showScheme3Bubble}
                    focused={inputFocused}
                    text={dockKeyboardOpen ? '输入你想记录的' : DOCK_PLACEHOLDER}
                  />
                  <textarea
                    ref={textAreaRef}
                    rows="1"
                    placeholder=""
                    aria-label={inputPlaceholder}
                    value={draft}
                    onChange={(e)=>{
                      onDraft(e.target.value);
                      e.target.style.height='auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 72)+'px';
                    }}
                    onFocus={()=>{
                      notifyGuideDockInteract();
                      setInputFocused(true);
                      // 已加图片 / 相册展开时聚焦输入框：相册收起，换成键盘
                      if(selectedPhotos.length){
                        setPhotoMenuRect(null);
                        setPhotosCollapsed(false);
                        setDockKeyboardOpen(true);
                      }
                    }}
                    onBlur={()=>{
                      setInputFocused(false);
                      if(dockKeyboardOpen){
                        setDockKeyboardOpen(false);
                        if(selectedPhotos.length) setPhotosCollapsed(true);
                      }
                    }}
                    onKeyDown={(e)=>{
                      if(e.key==='Enter' && !e.shiftKey && (draft.trim() || selectedPhotos.length)){
                        e.preventDefault();
                        sendGalleryRecord();
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={'dock-voice-wrap'+(recording?' is-recording':'')}>
                  {/* 演示浮层指示器 */}
                  {(recording || demoPhase === 'recognizing') && (
                    <div className={'dock-voice-float'+(demoPhase === 'recognizing' ? ' is-recognizing' : '')}>
                      <span className="dock-voice-float-text">
                        {demoPhase === 'recognizing' ? '识别中...' : '正在听...'}
                      </span>
                      {demoPhase === 'recognizing' && (
                        <span className="dock-voice-float-spinner"/>
                      )}
                    </div>
                  )}
                  <div className="dock-voice-stage" aria-hidden="true">
                    <span className="dock-voice-shimmer"/>
                  </div>
                  <button
                    type="button"
                    className={'dock-voice-btn'+(recording?' recording':'')}
                    onPointerDown={(e)=>{ e.preventDefault(); if(isDemoRunning) return; dismissGuideForVoice(); startRec(); }}
                    onPointerUp={stopRec}
                    onPointerLeave={recording ? stopRec : undefined}
                  >
                    {recording ? (
                      <>
                        <span className="dock-voice-waves" aria-hidden="true">
                          {[4,8,12,8,6,10,7].map((h,j)=><span key={j} style={{height:h+'px'}}/>)}
                        </span>
                        <span>松开 结束{recSec > 0 ? ' '+recSec+'s' : ''}</span>
                      </>
                    ) : (
                      <span className="dock-voice-label">按住 说话</span>
                    )}
                  </button>
                </div>
              )}

              {inputMode==='text' && draft.trim() && !showPhotoRow ? (
                <button type="button" className="dock-send-btn" onMouseDown={(e)=>e.preventDefault()} onClick={sendGalleryRecord} aria-label="发送">
                  <I name="send" size={16} strokeWidth={2}/>
                </button>
              ) : null}

              {showPhotoRow ? (
                <button type="button" className="dock-send-btn dock-photo-send-btn" onMouseDown={(e)=>e.preventDefault()} onClick={sendGalleryRecord} aria-label="发送">
                  <I name="send" size={18} strokeWidth={2}/>
                </button>
              ) : (
                <button
                  type="button"
                  className={'dock-camera-btn'+(photoMenuOpen ? ' is-active' : '')}
                  aria-label="添加图片"
                  aria-haspopup="menu"
                  aria-expanded={photoMenuOpen}
                  onMouseDown={(e)=>e.preventDefault()}
                  onClick={(e)=>togglePhotoMenu(e.currentTarget)}
                >
                  <I name="camera" size={22} strokeWidth={1.7}/>
                </button>
              )}
            </div>
            {showPhotoRow ? (
              <div className="dock-photo-attachment-row">
                <div className="dock-selected-photos" aria-label={`已选${selectedPhotos.length}张照片`}>
                  {selectedPhotos.map(photo=>(
                    <button type="button" key={photo.id} onMouseDown={(e)=>e.preventDefault()} onClick={()=>togglePhoto(photo)} aria-label="移除这张照片">
                      <img src={photo.src} alt=""/>
                      {photo.videoDuration != null ? (
                        <em className="dock-selected-video-badge">▶ {formatCameraDuration(photo.videoDuration)}</em>
                      ) : null}
                      <span>×</span>
                    </button>
                  ))}
                  {selectedPhotos.length < PHOTO_LIMIT ? (
                    <button
                      type="button"
                      className={'dock-photo-add-btn'+(photoMenuOpen ? ' is-active' : '')}
                      aria-label="继续添加图片"
                      aria-haspopup="menu"
                      aria-expanded={photoMenuOpen}
                      onMouseDown={(e)=>e.preventDefault()}
                      onClick={(e)=>togglePhotoMenu(e.currentTarget)}
                    >
                      <I name="plus" size={22} strokeWidth={1.6}/>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            </div>

            {dockKeyboardOpen ? (
              <DockIosKeyboard
                canSend={!!draft.trim() || selectedPhotos.length > 0}
                onKey={(key)=>onDraft(draft + key)}
                onBackspace={()=>onDraft(draft.slice(0, -1))}
                onSend={sendGalleryRecord}
              />
            ) : null}

          </div>
          )}
        </div>
      </div>
    </>
  );
}

const RECORD_CAMERA_MODES = [
  { id:'video', label:'录像' },
  { id:'photo', label:'拍照' },
];

function formatCameraDuration(sec){
  const s = Math.max(0, sec | 0);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// 记录页拍照：仿系统相机（关闭 / 闪光灯、4:3 取景、焦距、录像|拍照 左右滑切换）
function RecordSystemCamera({ previewSrc, albumSrc, onClose, onOpenAlbum, onCapture }){
  const [modeIndex, setModeIndex] = React.useState(1);
  const [zoom, setZoom] = React.useState('1x');
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordSec, setRecordSec] = React.useState(0);
  // 拍完先停在「拍摄完成」预览，用户点确定才回到输入框
  const [pendingCapture, setPendingCapture] = React.useState(null);
  const swipeStart = React.useRef(null);
  const mode = RECORD_CAMERA_MODES[modeIndex].id;

  React.useEffect(()=>{
    if(!isRecording) return undefined;
    const timer = setInterval(()=>setRecordSec(sec=>sec + 1), 1000);
    return ()=>clearInterval(timer);
  }, [isRecording]);

  const switchMode = (index)=>{
    if(isRecording || pendingCapture) return;
    setModeIndex(Math.max(0, Math.min(RECORD_CAMERA_MODES.length - 1, index)));
  };

  const onSwipeStart = (event)=>{
    if(event.target.closest?.('button')) return;
    swipeStart.current = event.clientX;
  };
  const onSwipeEnd = (event)=>{
    if(swipeStart.current == null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    // 右滑看到左侧的「录像」，左滑回到「拍照」
    if(dx > 36) switchMode(modeIndex - 1);
    else if(dx < -36) switchMode(modeIndex + 1);
  };

  const handleShutter = ()=>{
    if(mode === 'photo'){
      setPendingCapture({ mode:'photo' });
      return;
    }
    if(!isRecording){
      setRecordSec(0);
      setIsRecording(true);
      return;
    }
    setIsRecording(false);
    setPendingCapture({ mode:'video', duration:Math.max(1, recordSec) });
  };

  const retake = ()=>{
    setPendingCapture(null);
    setRecordSec(0);
  };

  return (
    <div className={'record-camera-page is-system'+(isRecording ? ' is-recording' : '')+(pendingCapture ? ' is-reviewing' : '')} role="dialog" aria-modal="true" aria-label="相机">
      <div className="record-camera-top">
        <button type="button" className="record-camera-close" onClick={onClose} aria-label="关闭">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>
        {pendingCapture ? (
          <span className="record-camera-review-title">{pendingCapture.mode === 'video' ? '录像完成' : '拍摄完成'}</span>
        ) : isRecording ? (
          <span className="record-camera-timer"><i/>{formatCameraDuration(recordSec)}</span>
        ) : (
          <span className="record-camera-more" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        )}
        <button type="button" className="record-camera-flash" aria-label="闪光灯：关闭" disabled={!!pendingCapture}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"><path d="M13 3L6 13h5l-1 8 7-10h-5l1-8z"/><path d="M4 4l16 16"/></svg>
        </button>
      </div>

      <div className="record-camera-viewfinder">
        <img src={previewSrc} alt={pendingCapture ? '刚拍好的照片' : '相机取景画面'}/>
        {pendingCapture ? (
          <>
            <span className="record-camera-shot-flash" aria-hidden="true"/>
            {pendingCapture.mode === 'video' ? (
              <span className="record-camera-review-video">▶ {formatCameraDuration(pendingCapture.duration)}</span>
            ) : null}
          </>
        ) : (
          <div className="record-camera-zoom" role="group" aria-label="焦距">
            {['0.6','1x','2'].map(z=>(
              <button key={z} type="button" className={zoom === z ? 'is-active' : ''} onClick={()=>setZoom(z)}>{z}</button>
            ))}
          </div>
        )}
      </div>

      {pendingCapture ? (
        <div className="record-camera-review-bar">
          <button type="button" className="record-camera-retake" onClick={retake}>重拍</button>
          <button type="button" className="record-camera-confirm" onClick={()=>onCapture(pendingCapture)}>确定</button>
        </div>
      ) : (
        <div
          className="record-camera-bottom"
          onPointerDown={onSwipeStart}
          onPointerUp={onSwipeEnd}
          onPointerCancel={()=>{ swipeStart.current = null; }}
        >
          <div className={'record-camera-modes'+(isRecording ? ' is-hidden' : '')} role="tablist" aria-label="拍摄模式">
            <div className="record-camera-modes-track" style={{transform:`translateX(${-(modeIndex * 56 + 28)}px)`}}>
              {RECORD_CAMERA_MODES.map((m, index)=>(
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={index === modeIndex}
                  className={index === modeIndex ? 'is-active' : ''}
                  onClick={()=>switchMode(index)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="record-camera-controls">
            <button type="button" className="record-camera-album-shortcut" onClick={onOpenAlbum} aria-label="打开相册" disabled={isRecording}>
              <img src={albumSrc} alt=""/>
            </button>
            <button
              type="button"
              className={'record-camera-shutter is-'+mode+(isRecording ? ' is-recording' : '')}
              onClick={handleShutter}
              aria-label={mode === 'photo' ? '拍照' : (isRecording ? '停止录像' : '开始录像')}
            >
              <span/>
            </button>
            <button type="button" className="record-camera-flip" aria-label="切换摄像头" disabled={isRecording}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10a3 3 0 013 3v8"/><path d="M17 20H7a3 3 0 01-3-3V9"/><path d="M17.5 12.5L20 15l2.5-2.5"/><path d="M6.5 11.5L4 9l-2.5 2.5"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DOCK_KB_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

// 模拟系统键盘：按键 preventDefault，保持输入框焦点
function DockIosKeyboard({ canSend, onKey, onBackspace, onSend }){
  const keep = (e)=>e.preventDefault();
  return (
    <div className="record-dock-keyboard" aria-hidden="true">
      <div className="ios-kb-rows">
        {DOCK_KB_ROWS.map((row, rowIndex)=>(
          <div key={rowIndex} className="ios-kb-row">
            {rowIndex === 2 ? <span className="ios-kb-key ios-kb-key--wide ios-kb-key--ghost">⇧</span> : null}
            {row.map(key=>(
              <button key={key} type="button" className="ios-kb-key" onMouseDown={keep} onClick={()=>onKey(key)}>{key}</button>
            ))}
            {rowIndex === 2 ? (
              <button type="button" className="ios-kb-key ios-kb-key--wide ios-kb-key--ghost" onMouseDown={keep} onClick={onBackspace} aria-label="删除">⌫</button>
            ) : null}
          </div>
        ))}
        <div className="ios-kb-row ios-kb-row--bottom">
          <span className="ios-kb-key ios-kb-key--fn">123</span>
          <span className="ios-kb-key ios-kb-key--fn">☺</span>
          <button type="button" className="ios-kb-key ios-kb-key--space" onMouseDown={keep} onClick={()=>onKey(' ')}>拼音</button>
          <button
            type="button"
            className={'ios-kb-key ios-kb-key--fn record-dock-kb-send'+(canSend ? ' is-ready' : '')}
            onMouseDown={keep}
            onClick={()=>{ if(canSend) onSend(); }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DockPublisher, CloudPublisher: DockPublisher, UnifiedQuickIcon });
