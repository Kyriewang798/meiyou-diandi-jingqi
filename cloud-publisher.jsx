// ============ 底部 Dock — 输入栏 + 右下悬浮快捷发布 ============

function UnifiedQuickIcon({type}){
  const key = type === 'period-feel' ? 'menses'
    : type === 'beverage' ? 'water'
    : type;
  const colors = {
    menses:['#ff8fb4','#ff5f8f','#ff3d7a'],
    'period-start':['#ff9bb8','#ff5f8f','#ff3d7a'],
    'period-end':['#ffd0e0','#ff9eb8','#f07a9e'],
    weight:['#c5a3f8','#ac78f3','#9b5ef0'],
    symptom:['#8fcdff','#4fb0f7','#2e9bf0'], mood:['#ffeb93','#ffd849','#ffc700'],
    diet:['#ffb68e','#ff7d47','#ff5f22'], water:['#8fe8c4','#34cf99','#16b981'],
    stool:['#ffd98a','#ffb84a','#f09a28'], exercise:['#ff9b8a','#ff6b5a','#f24b3d'],
    sleep:['#c9b6ff','#9b7cf0','#7a58e0'], medicine:['#9bd8ff','#5eb6f5','#3a9ae6'],
    habit:['#9be0c4','#4ecf9a','#2bb87a'], diary:['#ffe08a','#ffc94a','#f0ad1e'],
    checkup:['#9ec8ff','#6aa3f5','#4a86e8'], account:['#ffd28a','#ffb24a','#f09220'],
    travel:['#9ad8ff','#5bb8f2','#3498e0'], pet:['#ffc09a','#ff9460','#f07438'],
  }[key] || ['#c9c9cf','#aaaab0','#888990'];
  const id = 'quick-' + key;
  const body = {
    menses:<><path d="M32 11.5c8.8 9.9 15 17.6 15 24.8A15 15 0 0 1 17 36.3c0-7.2 6.2-14.9 15-24.8z" fill={'url(#b-'+id+')'}/><g stroke="#fff" strokeLinecap="round" fill="none" opacity=".72"><path d="M25.4 33.6v6.4" strokeWidth="3.1"/><path d="M32 29.6v14.6" strokeWidth="3.4"/><path d="M38.6 32.4v8.8" strokeWidth="3.1"/></g><ellipse cx="25.8" cy="25.4" rx="3.4" ry="5.2" fill={'url(#h-'+id+')'} transform="rotate(-28 25.8 25.4)"/></>,
    'period-start':<><path d="M32 12c9.2 10.4 15.6 18.4 15.6 26.2A15.6 15.6 0 1 1 16.4 38.2C16.4 30.4 22.8 22.4 32 12z" fill={'url(#b-'+id+')'}/><ellipse cx="26.2" cy="34.5" rx="5.2" ry="3.4" fill="#fff" opacity=".55"/><path d="M29.5 28.5c1.8 4.2 4.8 6.4 7.8 6.8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".7"/></>,
    'period-end':<><path d="M32 11c8.6 9.7 14.8 17.2 14.8 25.2A14.8 14.8 0 1 1 17.2 36.2C17.2 28.2 23.4 20.7 32 11z" fill={'url(#b-'+id+')'}/><ellipse cx="25.6" cy="26.2" rx="3.6" ry="5.4" fill="#fff" opacity=".55" transform="rotate(-28 25.6 26.2)"/><path d="M24.2 36.6l5.2 5.2 11.2-11.6" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    weight:<><rect x="10" y="24" width="44" height="27" rx="10" fill={'url(#b-'+id+')'}/><path d="M21 42a11 11 0 0 1 22 0z" fill="#fff" opacity=".85"/><path d="M32 42l6.2-7.2" stroke="#7b3fd6" strokeWidth="2.6" strokeLinecap="round"/><circle cx="32" cy="42" r="1.9" fill="#7b3fd6"/></>,
    symptom:<><path d="M26 16h12a5 5 0 0 1 5 5v3H21v-3a5 5 0 0 1 5-5z" fill={'url(#b-'+id+')'} opacity=".85"/><rect x="11" y="22" width="42" height="30" rx="10" fill={'url(#b-'+id+')'}/><g fill="#fff" opacity=".92"><rect x="28.6" y="29" width="6.8" height="16" rx="3.4"/><rect x="24" y="33.6" width="16" height="6.8" rx="3.4"/></g></>,
    mood:<><circle cx="32" cy="33" r="20" fill={'url(#b-'+id+')'}/><g fill="#c98600"><ellipse cx="25" cy="29.5" rx="2.7" ry="3.4"/><ellipse cx="39" cy="29.5" rx="2.7" ry="3.4"/></g><path d="M24.5 38.5c2 3.4 4.6 5.1 7.5 5.1s5.5-1.7 7.5-5.1" stroke="#c98600" strokeWidth="3.2" strokeLinecap="round" fill="none"/></>,
    diet:<><g fill="#fff4e6"><rect x="33" y="35" width="20" height="8.6" rx="4.3" transform="rotate(42 33 35)"/><circle cx="46.5" cy="47.5" r="5.4"/><circle cx="50.5" cy="43.5" r="4.6"/></g><path d="M17.6 17.4c7-6.4 17.4-5.6 22.4.6s4.2 15.4-2.4 21-16.6 5.4-21.4-1.2-5.6-14 1.4-20.4z" fill={'url(#b-'+id+')'}/></>,
    water:<><path d="M18.5 17h27a2 2 0 0 1 2 2.2l-3.1 28.4A6.5 6.5 0 0 1 38 53.4H26a6.5 6.5 0 0 1-6.4-5.8L16.5 19.2a2 2 0 0 1 2-2.2z" fill={'url(#g-'+id+')'}/><path d="M21 31.5h22l-1.8 16.1a6.5 6.5 0 0 1-6.4 5.8H29.2a6.5 6.5 0 0 1-6.4-5.8z" fill={'url(#b-'+id+')'}/></>,
    stool:<><path d="M32 14c4.2 0 7.2 2.6 8.2 6.2 3.8.4 6.8 3.4 6.8 7.2 0 .6-.1 1.2-.2 1.8 3.2 1.2 5.4 4.2 5.4 7.8 0 4.6-3.6 8.2-8.2 8.2H20c-4.6 0-8.2-3.6-8.2-8.2 0-3.6 2.2-6.6 5.4-7.8-.1-.6-.2-1.2-.2-1.8 0-3.8 3-6.8 6.8-7.2C24.8 16.6 27.8 14 32 14z" fill={'url(#b-'+id+')'}/><path d="M26 40c2.2 2.4 4.6 3.5 6 3.5s3.8-1.1 6-3.5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity=".9"/></>,
    exercise:<><circle cx="36" cy="16.5" r="5.2" fill={'url(#b-'+id+')'}/><path d="M18 28.5c3.2-1.2 6.8-1.6 10.2-.4l6.6 2.4 7.8-6.2c1.2-1 3-.4 3.4 1.1l1.6 6.2c.4 1.4-.6 2.8-2 3l-8.2 1.2-4.6 10.4c-.6 1.4-2.4 1.8-3.6.8L21.4 39c-1.2-1-.8-3 .6-3.6l5.2-2.2-4.8-1.8c-2.2-.8-4.4.2-5.2 2.2l-2.8 7.2c-.6 1.4-2.2 2-3.6 1.4l-1.8-.8c-1.6-.8-2-2.8-1-4.2z" fill={'url(#b-'+id+')'}/><path d="M28 48l-2.4 6.8c-.4 1.2.4 2.4 1.6 2.8h.2c1 .2 2-.4 2.4-1.4L34 48" fill="#fff" opacity=".88"/></>,
    sleep:<><path d="M38.5 18.5a13.5 13.5 0 1 0 1.2 24.2 16.5 16.5 0 0 1-1.2-24.2z" fill={'url(#b-'+id+')'}/><g fill="#fff" opacity=".85"><circle cx="44" cy="22" r="2"/><circle cx="48.5" cy="27.5" r="1.4"/><circle cx="42.5" cy="30.5" r="1.1"/></g></>,
    medicine:<><rect x="14" y="26" width="36" height="16" rx="8" fill={'url(#b-'+id+')'}/><path d="M32 26v16" stroke="#fff" strokeWidth="2.4" opacity=".35"/><circle cx="23" cy="34" r="3.2" fill="#fff" opacity=".9"/><rect x="38" y="31.4" width="6.4" height="5.2" rx="2.6" fill="#fff" opacity=".9"/></>,
    habit:<><circle cx="32" cy="32" r="18" fill={'url(#b-'+id+')'}/><path d="M23.5 32.2l5.2 5.4 12-12.4" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    diary:<><rect x="16" y="12" width="30" height="40" rx="7" fill={'url(#b-'+id+')'}/><path d="M40 12v10l-4-2.4-4 2.4V12" fill="#fff" opacity=".88"/><g fill="#fff" opacity=".78"><rect x="22" y="30" width="16" height="3.2" rx="1.6"/><rect x="22" y="37" width="12" height="3.2" rx="1.6"/></g></>,
    checkup:<><rect x="15" y="14" width="34" height="38" rx="8" fill={'url(#b-'+id+')'}/><path d="M24 14v-2.5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4V14" fill={'url(#b-'+id+')'} opacity=".85"/><g fill="#fff" opacity=".9"><circle cx="23" cy="28" r="2.4"/><rect x="28" y="26.4" width="14" height="3.2" rx="1.6"/><circle cx="23" cy="38" r="2.4"/><rect x="28" y="36.4" width="14" height="3.2" rx="1.6"/></g></>,
    account:<><circle cx="32" cy="32" r="18" fill={'url(#b-'+id+')'}/><path d="M32 20.5v23M26.5 25.5c1.2-2 3.2-3.2 5.5-3.2 3.4 0 5.8 1.8 5.8 4.6s-2.4 4.4-6.2 5.2c-3.6.8-5.8 2.4-5.8 5.2 0 2.8 2.6 4.8 6.2 4.8 2.4 0 4.4-1 5.6-2.8" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none"/></>,
    travel:<><path d="M14 34.5l12.5-3.2L42 14.8c1.2-1.4 3.4-.4 3.4 1.5v.2L39.6 32l10.8 2.8c1.4.4 1.4 2.4 0 2.8L39.6 40l5.8 15.5c.4 1.2-.8 2.2-2 1.6L28.5 47.2 16 50.5c-1.6.4-3-1.2-2.4-2.8L18 36.2z" fill={'url(#b-'+id+')'}/></>,
    pet:<><path d="M20 26c0-3.2 2.2-5.6 5-5.6s5 2.4 5 5.6-2.2 5.6-5 5.6-5-2.4-5-5.6zm14 0c0-3.2 2.2-5.6 5-5.6s5 2.4 5 5.6-2.2 5.6-5 5.6-5-2.4-5-5.6zM14.5 36c0-3 2-5.2 4.6-5.2s4.6 2.2 4.6 5.2-2 5.2-4.6 5.2-4.6-2.2-4.6-5.2zm26.4 0c0-3 2-5.2 4.6-5.2s4.6 2.2 4.6 5.2-2 5.2-4.6 5.2-4.6-2.2-4.6-5.2z" fill={'url(#b-'+id+')'} opacity=".92"/><ellipse cx="32" cy="44" rx="11" ry="9.5" fill={'url(#b-'+id+')'}/></>,
  }[key] || <circle cx="32" cy="32" r="12" fill={'url(#b-'+id+')'} opacity=".55"/>;
  return <svg className="dock-unified-quick-icon" viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><defs><linearGradient id={'b-'+id} x1="24%" y1="4%" x2="78%" y2="96%"><stop stopColor={colors[0]}/><stop offset=".52" stopColor={colors[1]}/><stop offset="1" stopColor={colors[2]}/></linearGradient><linearGradient id={'g-'+id} x1="20%" y1="0%" x2="85%" y2="100%"><stop stopColor={colors[0]} stopOpacity=".55"/><stop offset="1" stopColor={colors[1]} stopOpacity=".38"/></linearGradient><radialGradient id={'h-'+id}><stop stopColor="#fff" stopOpacity=".95"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs><circle cx="32" cy="32" r="32" fill="#fff"/><ellipse cx="32" cy="54" rx="15" ry="4.6" fill={colors[2]} opacity=".2"/>{body}</svg>;
}

/** 圆形发送图标（纸飞机 · 对齐美柚记录输入） */
function DockSendIco({size=16}){
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/>
    </svg>
  );
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

function DockWavePlaceholder({show, focused}){
  if(!show) return null;

  return (
    <span
      className={'dock-float-ph'+(focused ? ' is-focused' : '')}
      aria-hidden="true"
    >
      <span className="dock-float-ph-char is-idle">{DOCK_PLACEHOLDER}</span>
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
  forceTextModeKey = 0,
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
  const [feedingExpanded, setFeedingExpanded] = React.useState(false);
  const [feedingPage, setFeedingPage] = React.useState(0);
  const [periodFeelGuidePos, setPeriodFeelGuidePos] = React.useState(null);
  const recTimer = React.useRef(null);
  const prevTabRef = React.useRef(activeTab);
  const containerRef = React.useRef(null);
  const feedingDragStartY = React.useRef(null);
  const feedingSwipeRef = React.useRef({x:0, y:0, active:false, locked:null});
  const textAreaRef = React.useRef(null);
  const dockWrapRef = React.useRef(null);

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
    if(!forceTextModeKey) return;
    setInputMode('text');
    const t = setTimeout(()=>{
      const el = textAreaRef.current;
      if(!el) return;
      el.focus();
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 72) + 'px';
      const len = el.value.length;
      try{ el.setSelectionRange(len, len); }catch(_){}
    }, 40);
    return ()=>clearTimeout(t);
  }, [forceTextModeKey]);

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
    onDockExpandedChange?.(!!dockSheet || !!quickSelected);
  }, [dockSheet, quickSelected, onDockExpandedChange]);

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
  const isQuickActive = quickOpen || !!quickSelected;
  const inputPlaceholder = dockPlaceholder || DOCK_PLACEHOLDER;
  const showFeedingQuick = Array.isArray(feedingQuickItems) && feedingQuickItems.length > 0;
  const FEEDING_COLS = 5;
  const FEEDING_MAX_ROWS = 3;
  const FEEDING_PAGE_SIZE = FEEDING_COLS * FEEDING_MAX_ROWS; // 每页最多 3 行 × 5 列
  const feedingPages = React.useMemo(()=>{
    const items = feedingQuickItems || [];
    if(!items.length) return [[]];
    const pages = [];
    for(let i = 0; i < items.length; i += FEEDING_PAGE_SIZE){
      pages.push(items.slice(i, i + FEEDING_PAGE_SIZE));
    }
    return pages;
  }, [feedingQuickItems]);
  const feedingPageCount = feedingPages.length;
  const feedingPageSafe = Math.min(feedingPage, Math.max(0, feedingPageCount - 1));

  React.useEffect(()=>{
    setFeedingPage(0);
  }, [feedingQuickItems]);

  React.useEffect(()=>{
    if(feedingPage > feedingPageCount - 1){
      setFeedingPage(Math.max(0, feedingPageCount - 1));
    }
  }, [feedingPage, feedingPageCount]);

  /* 收起：只渲染首页前 2 行做透出；展开：每页最多 3 行，左右滑翻页 */
  const feedingVisiblePages = feedingExpanded
    ? feedingPages
    : [(feedingPages[0] || []).slice(0, FEEDING_COLS * 2)];

  React.useEffect(()=>{
    if(!feedingExpanded) setFeedingPage(0);
  }, [feedingExpanded]);

  React.useLayoutEffect(()=>{
    if(!periodFeelGuide || !showFeedingQuick){
      setPeriodFeelGuidePos(null);
      return;
    }
    const update = ()=>{
      const wrap = dockWrapRef.current;
      if(!wrap) return;
      const r = wrap.getBoundingClientRect();
      setPeriodFeelGuidePos({
        left: Math.round(r.left + 18),
        bottom: Math.round(window.innerHeight - r.top + 12),
        maxWidth: Math.min(250, Math.max(160, Math.round(r.width - 36))),
      });
    };
    update();
    window.addEventListener('resize', update);
    return ()=>window.removeEventListener('resize', update);
  }, [periodFeelGuide, showFeedingQuick, feedingExpanded, dockSheet, feedingPageSafe]);

  const MoodOverlay = window.MoodQuickOverlay || (()=>null);
  const SymptomOverlay = window.SymptomQuickOverlay || (()=>null);

  const startFeedingPanelDrag = (clientY)=>{
    if(!showFeedingQuick) return;
    feedingDragStartY.current = clientY;
  };

  const finishFeedingPanelDrag = (clientY)=>{
    if(!showFeedingQuick || feedingDragStartY.current == null) return;
    const dy = clientY - feedingDragStartY.current;
    feedingDragStartY.current = null;
    if(feedingSwipeRef.current.locked === 'x') return;
    if(dy < -18) setFeedingExpanded(true);
    if(dy > 18) setFeedingExpanded(false);
  };

  const onFeedingSwipeStart = (event)=>{
    if(!feedingExpanded || feedingPageCount <= 1) return;
    const touch = event.touches?.[0] || event;
    feedingSwipeRef.current = {x: touch.clientX, y: touch.clientY, active:true, locked:null};
  };

  const onFeedingSwipeMove = (event)=>{
    const state = feedingSwipeRef.current;
    if(!state.active) return;
    const touch = event.touches?.[0] || event;
    const dx = touch.clientX - state.x;
    const dy = touch.clientY - state.y;
    if(state.locked == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)){
      state.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if(state.locked === 'x'){
      if(event.cancelable) event.preventDefault();
      feedingDragStartY.current = null;
    }
  };

  const onFeedingSwipeEnd = (event)=>{
    const state = feedingSwipeRef.current;
    if(!state.active) return;
    const touch = event.changedTouches?.[0] || event;
    const dx = touch.clientX - state.x;
    const locked = state.locked;
    feedingSwipeRef.current = {x:0, y:0, active:false, locked:null};
    if(locked !== 'x') return;
    if(dx <= -42) setFeedingPage(p=>Math.min(feedingPageCount - 1, p + 1));
    if(dx >= 42) setFeedingPage(p=>Math.max(0, p - 1));
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
      {!hideQuickFan && (
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

      {ReactDOM.createPortal(
        <SymptomOverlay
          open={symptomPickerOpen}
          onSubmit={handleSymptomOverlaySubmit}
          onClose={closeSymptomPicker}
        />,
        document.body
      )}

      {periodFeelGuide && periodFeelGuidePos && ReactDOM.createPortal(
        <div
          className="period-feel-guide-bubble is-dock-float"
          role="status"
          style={{
            left: periodFeelGuidePos.left + 'px',
            bottom: periodFeelGuidePos.bottom + 'px',
            maxWidth: periodFeelGuidePos.maxWidth + 'px',
          }}
        >
          {periodFeelGuideText}
          <span className="period-feel-guide-arrow" aria-hidden="true" />
        </div>,
        document.querySelector('.phone') || document.body
      )}

      <div
        ref={dockWrapRef}
        className={'dock-wrap'+(isDockExpanded?' is-mood-expanded':'')+(showFeedingQuick?' is-feeding-dock':'')+(feedingExpanded?' is-feeding-expanded':'')+(periodFeelGuide?' has-period-feel-guide':'')}
      >
        <div
          className={'dock-panel'
            +(!dockSheet ? ' is-path-dock' : '')
            +(isDockExpanded?' is-mood-expanded':'')
            +(showFeedingQuick?' is-feeding-dock':'')
            +(feedingExpanded?' is-feeding-expanded':'')}
          onPointerDown={showFeedingQuick ? (e)=>startFeedingPanelDrag(e.clientY) : undefined}
          onPointerUp={showFeedingQuick ? (e)=>finishFeedingPanelDrag(e.clientY) : undefined}
          onPointerCancel={showFeedingQuick ? ()=>{ feedingDragStartY.current = null; } : undefined}
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
          <div className={'dock-bar is-path-dock'+(showFeedingQuick ? ' has-feeding-quick' : '')}>
            {showFeedingQuick ? (
              <div className="dock-feeding-quick" aria-label={feedingQuickLabel}>
                <button
                  type="button"
                  className="dock-feeding-handle"
                  aria-label={feedingExpanded ? '收起快捷记录面板' : '展开快捷记录面板'}
                  aria-expanded={feedingExpanded}
                  onClick={()=>setFeedingExpanded(v=>!v)}
                >
                  <span/>
                </button>
                <div
                  className={'dock-feeding-quick-viewport'+(feedingExpanded && feedingPageCount > 1 ? ' is-paged' : '')}
                  onTouchStart={onFeedingSwipeStart}
                  onTouchMove={onFeedingSwipeMove}
                  onTouchEnd={onFeedingSwipeEnd}
                  onTouchCancel={onFeedingSwipeEnd}
                  onPointerDown={(e)=>{
                    if(e.pointerType === 'touch') return;
                    onFeedingSwipeStart(e);
                  }}
                  onPointerMove={(e)=>{
                    if(e.pointerType === 'touch') return;
                    onFeedingSwipeMove(e);
                  }}
                  onPointerUp={(e)=>{
                    if(e.pointerType === 'touch') return;
                    onFeedingSwipeEnd(e);
                  }}
                  onPointerCancel={(e)=>{
                    if(e.pointerType === 'touch') return;
                    onFeedingSwipeEnd(e);
                  }}
                >
                  <div
                    className="dock-feeding-quick-track"
                    style={feedingExpanded ? {transform:`translateX(-${feedingPageSafe * 100}%)`} : undefined}
                  >
                    {feedingVisiblePages.map((pageItems, pageIdx)=>(
                      <div
                        key={'feeding-page-'+pageIdx}
                        className="dock-feeding-quick-scroll"
                        aria-hidden={feedingExpanded && pageIdx !== feedingPageSafe}
                      >
                        {pageItems.map((item)=>(
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
                    ))}
                  </div>
                </div>
                {feedingExpanded && feedingPageCount > 1 ? (
                  <div className="dock-feeding-page-dots" role="tablist" aria-label="快捷记录翻页">
                    {feedingPages.map((_, idx)=>(
                      <button
                        key={'dot-'+idx}
                        type="button"
                        role="tab"
                        aria-selected={idx === feedingPageSafe}
                        className={'dock-feeding-page-dot'+(idx === feedingPageSafe ? ' is-active' : '')}
                        onClick={()=>setFeedingPage(idx)}
                        aria-label={'第'+(idx + 1)+'页'}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="dock-input-row dock-input-pill">
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
                    }}
                    onBlur={()=>setInputFocused(false)}
                    onKeyDown={(e)=>{
                      if(e.key==='Enter' && !e.shiftKey && draft.trim()){
                        e.preventDefault();
                        onSend();
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

              {inputMode==='text' && draft.trim() ? (
                <button type="button" className="dock-send-btn" onClick={onSend} aria-label="发送">
                  <DockSendIco size={15}/>
                </button>
              ) : null}
            </div>

          </div>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { DockPublisher, CloudPublisher: DockPublisher, UnifiedQuickIcon });
