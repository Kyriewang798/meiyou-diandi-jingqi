// ============ 饮食反馈卡片 — 基于规则表的多维度反馈 ============
// 维度A：识别结果 | 维度B：当日汇总与趋势 | 维度C：热量解读
// 维度D：周期关联 | 维度E：饮食多样性 | 维度F：记录里程碑
// 展示上限：最多3个维度，优先级 A > B > C > D > E > F

const DIET_FB_PRIMARY = '#ff4d88';
const DIET_FB_GREEN = '#00cc99';
const DIET_FB_ORANGE = '#ff8c42';

// ===== 工具函数 =====
function formatKcal(n){ return n != null ? n.toLocaleString() : '—'; }

function parseDietTimeToMinutes(timeStr){
  const match = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function resolveMealTypeFromTime(timeStr){
  const mins = parseDietTimeToMinutes(timeStr);
  if (mins == null) return '';
  if (mins >= 5 * 60 && mins <= 9 * 60) return '早餐';
  if (mins >= 9 * 60 + 1 && mins <= 10 * 60 + 30) return '早加餐';
  if (mins >= 10 * 60 + 31 && mins <= 13 * 60 + 30) return '午餐';
  if (mins >= 13 * 60 + 31 && mins <= 16 * 60) return '午加餐';
  if (mins >= 16 * 60 + 1 && mins <= 20 * 60) return '晚餐';
  if (mins >= 20 * 60 + 1) return '晚加餐';
  if (mins <= 4 * 60 + 59) return '其他';
  return '其他';
}

function formatDietLeadingLabel(leadingLabel = '', mealTypeLabel = ''){
  const base = String(leadingLabel || '饮食：').replace(/：$/, '');
  if (!mealTypeLabel) return leadingLabel || '饮食：';
  return `${base}（${mealTypeLabel}）：`;
}

// ===== 卡路里环形图（复用点滴 ChartCaloriePanel） =====
function DietTrendChart({ data, todayKcal }){
  const ChartCaloriePanel = window.ChartCaloriePanel;
  if (!ChartCaloriePanel) return null;
  return (
    <div className="diet-fb-chart-box diet-fb-calorie-ring">
      <ChartCaloriePanel consumed={todayKcal} hideNote />
    </div>
  );
}

function DietSecBHeader({ title = '卡路里摄入量' }){
  return (
    <div className="diet-fb-b-header">
      <span className="diet-fb-ai-badge">
        <span className="tl-period-analysis-spark" aria-hidden="true"/>
      </span>
      <span className="diet-fb-b-title">{title}</span>
    </div>
  );
}

function DietAiChevron({ open }){
  return (
    <svg
      className={'diet-fb-ai-chevron' + (open ? ' is-open' : '')}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DietDayTotalSummary({ dayMealCount = 2, dayTotalKcal }){
  if (dayTotalKcal == null) return null;
  return (
    <div className="diet-fb-day-total diet-fb-day-total-in-ai">
      今天已记录 {dayMealCount} 餐，合计约 <b>{formatKcal(dayTotalKcal)} kcal</b>
    </div>
  );
}

function DietCycleDietTip({ text, subText, icon = '🩸' }){
  return (
    <div className="diet-fb-cycle-tip">
      <span className="diet-fb-cycle-tip-icon" aria-hidden="true">{icon}</span>
      <div className="diet-fb-cycle-tip-body">
        <p className="diet-fb-cycle-tip-text">{text}</p>
        {subText && <p className="diet-fb-cycle-tip-sub">{subText}</p>}
      </div>
    </div>
  );
}

function getCycleDietTipDisplay(cycleData){
  const day = cycleData?.day ?? 2;
  return {
    text: getCycleDietTipText(),
    subText: `当前经期第 ${day} 天`,
  };
}

function getCycleDietTipText(){
  return '经期可以适当多吃些含铁食物，比如红肉、菠菜、黑木耳，帮助补充流失的铁元素。';
}

function getUnlockTrendGuideText(daysWithRecord = 0){
  const daysLeft = Math.max(0, 3 - daysWithRecord);
  return `再记录 ${daysLeft} 天饮食，即可解锁热量趋势图。`;
}

function DietGuideBelowTotal({ daysWithRecord = 0 }){
  return (
    <p className="diet-fb-guide-below-total diet-fb-stagger-in">
      {getUnlockTrendGuideText(daysWithRecord)}
    </p>
  );
}

function getDiversityInlineSuffix(count){
  if (count == null || count < 5) return null;
  return { count };
}

function roundRunMinutes(kcal){
  if (kcal == null) return 0;
  const raw = Math.round(kcal / 8);
  return Math.max(5, Math.round(raw / 5) * 5);
}

function resolveIronFoodName({ items = [], foods = [], foodTags = [], fallback = '菠菜' } = {}){
  const tagged = (items || []).find((it)=>Array.isArray(it?.tags) && it.tags.includes('含铁食物'));
  if(tagged?.name) return String(tagged.name).replace(/（.*）/, '');
  const nameFromItem = (items || []).find((it)=>/菠菜|红肉|黑木耳|猪肝|牛肉|鸡胸/.test(it?.name || ''));
  if(nameFromItem?.name) return String(nameFromItem.name).replace(/（.*）/, '');
  const nameFromFoods = (foods || []).find((name)=>/菠菜|红肉|黑木耳|猪肝|牛肉|鸡胸/.test(name || ''));
  if(nameFromFoods) return nameFromFoods;
  if((foodTags || []).includes('含铁食物')) return fallback;
  return fallback;
}

function DietNum({ children }){
  return <span className="diet-fb-stat-accent">{children}</span>;
}

function buildDietFeedbackLongCopy({
  dayMealCount = 2,
  dayTotalKcal = 1100,
  mealTypeLabel = '午餐',
  mealKcal = 700,
  ironFoodName = '菠菜',
} = {}){
  const meals = Math.max(1, Number(dayMealCount) || 2);
  const dayTotal = dayTotalKcal != null ? dayTotalKcal : 1100;
  const meal = mealKcal != null ? mealKcal : 700;
  const mealType = mealTypeLabel || '午餐';
  const iron = ironFoodName || '菠菜';
  const runMin = roundRunMinutes(meal);
  return `今天已记录${meals}餐，累计摄入${formatKcal(dayTotal)}千卡，${mealType}约${formatKcal(meal)}千卡，热量不低，相当于慢跑${runMin}分钟，经期吃${iron}很不错，有助于补充铁元素`;
}

function renderDietFeedbackLongCopy(ctx = {}){
  const meals = Math.max(1, Number(ctx.dayMealCount) || 2);
  const dayTotal = ctx.dayTotalKcal != null ? ctx.dayTotalKcal : 1100;
  const meal = ctx.mealKcal != null ? ctx.mealKcal : 700;
  const mealType = ctx.mealTypeLabel || '午餐';
  const iron = ctx.ironFoodName || '菠菜';
  const runMin = roundRunMinutes(meal);
  return (
    <>
      今天已记录<DietNum>{formatKcal(meals)}</DietNum>餐，累计摄入<DietNum>{formatKcal(dayTotal)}</DietNum>千卡，{mealType}约<DietNum>{formatKcal(meal)}</DietNum>千卡，热量不低，相当于慢跑<DietNum>{formatKcal(runMin)}</DietNum>分钟，经期吃{iron}很不错，有助于补充铁元素
    </>
  );
}

function getFeedbackDimCopy(dim, {
  dayMealCount = 2,
  dayTotalKcal = 1100,
  avgKcal,
  mealKcal = 700,
  todayFoodCount = 0,
  ironFoodName = '菠菜',
} = {}){
  switch (dim) {
    case 'A':
      return `今天饮食打卡${dayMealCount || 2}餐，合计${formatKcal(dayTotalKcal ?? 1100)}千卡。`;
    case 'B':
      if (avgKcal == null) return null;
      return `过去一周平均每天${formatKcal(avgKcal)}千卡。`;
    case 'C':
      return `这顿${formatKcal(mealKcal ?? 700)}千卡，分量刚刚好。`;
    case 'D':
      return `经期吃${ironFoodName || '菠菜'}很不错，有助于补充铁元素`;
    case 'E': {
      const n = todayFoodCount >= 5 ? todayFoodCount : 5;
      return `今天的饮食种类很丰富，${n}种食物能给身体带来多元营养`;
    }
    default:
      return null;
  }
}

function renderFeedbackDimCopy(dim, {
  dayMealCount = 2,
  dayTotalKcal = 1100,
  avgKcal,
  mealKcal = 700,
  todayFoodCount = 0,
  ironFoodName = '菠菜',
} = {}){
  switch (dim) {
    case 'A':
      return (
        <>
          今天饮食打卡<DietNum>{formatKcal(dayMealCount || 2)}</DietNum>餐，合计<DietNum>{formatKcal(dayTotalKcal ?? 1100)}</DietNum>千卡。
        </>
      );
    case 'B':
      if (avgKcal == null) return null;
      return (
        <>
          过去一周平均每天<DietNum>{formatKcal(avgKcal)}</DietNum>千卡。
        </>
      );
    case 'C':
      return (
        <>
          这顿<DietNum>{formatKcal(mealKcal ?? 700)}</DietNum>千卡，分量刚刚好。
        </>
      );
    case 'D':
      return <>经期吃{ironFoodName || '菠菜'}很不错，有助于补充铁元素</>;
    case 'E': {
      const n = todayFoodCount >= 5 ? todayFoodCount : 5;
      return (
        <>
          今天的饮食种类很丰富，<DietNum>{formatKcal(n)}</DietNum>种食物能给身体带来多元营养
        </>
      );
    }
    default:
      return null;
  }
}

function getFeedbackDimComboCopy(dims, ctx){
  if (!dims?.length) return null;
  return buildDietFeedbackLongCopy(ctx);
}

function DietFeedbackDimCopy({
  dim,
  dims,
  dayMealCount,
  dayTotalKcal,
  avgKcal,
  mealKcal,
  todayFoodCount,
  mealTypeLabel,
  ironFoodName,
}){
  const ctx = {
    dayMealCount,
    dayTotalKcal,
    avgKcal,
    mealKcal,
    todayFoodCount,
    mealTypeLabel,
    ironFoodName,
  };
  const content = dims?.length
    ? renderDietFeedbackLongCopy(ctx)
    : renderFeedbackDimCopy(dim, ctx);
  if (!content) return null;
  return <p className="diet-fb-b-stats">{content}</p>;
}

function DietAiAvgStats({ avgKcal, diversityCount, cycleText, cycleSplitParagraph }){
  const diversity = getDiversityInlineSuffix(diversityCount);
  const cycleInline = cycleText && !cycleSplitParagraph;

  return (
    <>
      <p className="diet-fb-b-stats">
        7日日均约{' '}
        <span className="diet-fb-stat-accent">{formatKcal(avgKcal)} kcal</span>
        {diversity && (
          <>
            ，今天吃了 <span className="diet-fb-stat-accent">{diversity.count}</span> 种食物，饮食多样性不错。
          </>
        )}
        {cycleInline && <>，{cycleText}</>}
      </p>
      {cycleSplitParagraph && cycleText && (
        <p className="diet-fb-b-stats-followup">{cycleText}</p>
      )}
    </>
  );
}

function resolveShowAiInsights({ showAi, displayCfg, hasInlineCalorieInsight }){
  if (!showAi) return false;
  if (displayCfg) return shouldShowDisplayAi(displayCfg);
  return !hasInlineCalorieInsight;
}

function shouldShowMealDiversity(displayCfg){
  return !!(
    displayCfg?.showDiversity
    && displayCfg?.diversityPlacement !== 'inline-after-avg'
  );
}

function shouldShowGuideBelowTotal(displayCfg){
  return !!displayCfg?.showGuideBelowTotal;
}

function shouldShowDisplayAi(cfg){
  if (!cfg) return false;
  return !!(
    cfg.feedbackDim ||
    (cfg.feedbackDims && cfg.feedbackDims.length) ||
    cfg.showGuide ||
    cfg.showChart ||
    cfg.showDayTotal ||
    cfg.showAvg ||
    cfg.showCycleTip ||
    cfg.showMilestone
  );
}

function DietDiversityTip({ count, placement = 'ai' }){
  if (count < 5) return null;
  const placementClass = placement === 'meal'
    ? ' diet-fb-diversity-tip--meal diet-fb-stagger-in diet-fb-stagger-in-delay'
    : '';
  return (
    <div className={'diet-fb-diversity-tip' + placementClass}>
      <div className="diet-fb-diversity-tip-inner">
        <span className="diet-fb-diversity-tip-icon" aria-hidden="true">🥗</span>
        <p className="diet-fb-diversity-tip-text">
          今天吃了 <strong>{count}</strong> 种食物，饮食多样性不错 <span className="diet-fb-diversity-tip-emoji">👍</span>
        </p>
      </div>
    </div>
  );
}

function DietMilestoneTip({ milestone, surprise = false }){
  const textByMilestone = {
    7: '已经连续记录 7 天饮食了！坚持记录能帮你更好地了解自己的饮食习惯 🎉',
    30: '饮食记录满 30 天！你对自己的饮食习惯已经有很好的了解了 📊',
    100: '饮食记录满 100 天，这份坚持本身就值得为自己鼓掌 💪',
  };
  const iconByMilestone = { 7: '🎉', 30: '📊', 100: '🎉' };
  const text = textByMilestone[milestone];
  if (!text) return null;
  return (
    <div className={'diet-fb-milestone-tip' + (surprise ? ' diet-fb-milestone-tip--surprise' : '')}>
      <div className="diet-fb-milestone-tip-inner">
        <span className="diet-fb-milestone-tip-icon" aria-hidden="true">{iconByMilestone[milestone] || '💪'}</span>
        <p className="diet-fb-milestone-tip-text">{text}</p>
      </div>
    </div>
  );
}

const DEFAULT_AI_BLOCK_ORDER = ['dayTotal', 'guide', 'chart', 'avg', 'milestone', 'cycleTip'];

function DietCalorieAiBody({
  weekData = [],
  todayKcal,
  daysWithRecord = 0,
  avgKcal,
  dayMealCount = 2,
  dayTotalKcal,
  mealKcal,
  displayScenario,
  cycleData = null,
  todayFoodCount = 0,
  time = '',
  foods = [],
  items = [],
  foodTags = [],
  mealTypeLabel: mealTypeLabelProp,
  ironFoodName: ironFoodNameProp,
  mealInterpretation = null,
  mealCalorieInsight = null,
}){
  const getConfig = window.getDietFeedbackDisplayConfig;
  const cfg = displayScenario && getConfig
    ? getConfig(displayScenario)
    : null;
  const mealTypeLabel = mealTypeLabelProp || resolveMealTypeFromTime(time) || '午餐';
  const ironFoodName = ironFoodNameProp || resolveIronFoodName({ items, foods, foodTags, fallback:'菠菜' });

  if (cfg?.feedbackDim || cfg?.feedbackDims?.length) {
    return (
      <>
        <DietTrendChart data={weekData} todayKcal={todayKcal}/>
        <DietFeedbackDimCopy
          dim={cfg.feedbackDim}
          dims={cfg.feedbackDims}
          dayMealCount={dayMealCount}
          dayTotalKcal={dayTotalKcal ?? todayKcal ?? 1100}
          avgKcal={avgKcal}
          mealKcal={mealKcal ?? todayKcal ?? 700}
          todayFoodCount={todayFoodCount}
          mealTypeLabel={mealTypeLabel}
          ironFoodName={ironFoodName}
        />
      </>
    );
  }

  const renderAiBlock = (blockType) => {
    if (!cfg) return null;
    switch (blockType) {
      case 'dayTotal':
        if (!cfg.showDayTotal) return null;
        return (
          <DietDayTotalSummary
            key="dayTotal"
            dayMealCount={dayMealCount}
            dayTotalKcal={dayTotalKcal ?? todayKcal}
          />
        );
      case 'guide':
        if (!cfg.showGuide) return null;
        return (
          <div key="guide" className="diet-fb-guide-text">
            {getUnlockTrendGuideText(daysWithRecord)}
          </div>
        );
      case 'chart':
        if (!cfg.showChart) return null;
        return (
          <React.Fragment key="chart">
            <DietTrendChart data={weekData} todayKcal={todayKcal}/>
            <DietMealInsightBelowChart
              interpretation={mealInterpretation}
              insight={mealCalorieInsight}
            />
          </React.Fragment>
        );
      case 'avg':
        if (!cfg.showAvg || avgKcal == null) return null;
        return (
          <DietAiAvgStats
            key="avg"
            avgKcal={avgKcal}
            diversityCount={
              cfg.showDiversity && cfg.diversityPlacement === 'inline-after-avg'
                ? todayFoodCount
                : null
            }
            cycleText={
              cfg.showCycleTip && cfg.cycleTipPlacement === 'inline-after-avg'
                ? getCycleDietTipText()
                : null
            }
            cycleSplitParagraph={!!cfg.cycleTipSplitParagraph}
          />
        );
      case 'milestone':
        if (!cfg.showMilestone) return null;
        return (
          <DietMilestoneTip
            key="milestone"
            milestone={cfg.showMilestone}
            surprise={!!cfg.milestoneSurprise}
          />
        );
      case 'cycleTip':
        if (!cfg.showCycleTip || cfg.cycleTipPlacement === 'inline-after-avg') return null;
        return <DietCycleDietTip key="cycleTip" {...getCycleDietTipDisplay(cycleData)}/>;
      default:
        return null;
    }
  };

  if (cfg) {
    const blockOrder = cfg.aiBlockOrder || DEFAULT_AI_BLOCK_ORDER;
    return <>{blockOrder.map((blockType) => renderAiBlock(blockType))}</>;
  }

  const showAvg = daysWithRecord >= 5;

  return (
    <>
      <DietTrendChart data={weekData} todayKcal={todayKcal}/>
      <DietMealInsightBelowChart
        interpretation={mealInterpretation}
        insight={mealCalorieInsight}
      />
      {showAvg && avgKcal ? (
        <div className="diet-fb-b-stats">7日日均约 <strong>{formatKcal(avgKcal)} kcal</strong></div>
      ) : null}
    </>
  );
}

function DietAiInsightsShell({ displayScenario, isNew, children }){
  const getConfig = window.getDietFeedbackDisplayConfig;
  const plainShell = displayScenario && getConfig?.(displayScenario)?.plainShell;
  const DietCalorieReviewEntry = window.DietCalorieReviewEntry;
  const reviewEntry = DietCalorieReviewEntry ? <DietCalorieReviewEntry/> : null;

  if (plainShell) {
    return (
      <>
        <div className="diet-fb-divider"/>
        <div className={'diet-fb-sec-b-plain' + (isNew ? ' diet-fb-stagger-in' : '')}>
          {children}
        </div>
        {reviewEntry}
      </>
    );
  }

  return (
    <DietAiCollapsibleSection defaultOpen animateIn={isNew} footer={reviewEntry}>
      {children}
    </DietAiCollapsibleSection>
  );
}

function DietAiCollapsibleSection({
  title = '卡路里摄入量',
  defaultOpen = true,
  animateIn = false,
  embedded = false,
  compact = false,
  footer = null,
  children,
}){
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <>
      <div className={'diet-fb-divider' + (embedded ? ' diet-fb-divider-bleed' : '')}/>
      <div className={'diet-fb-ai-collapsible' + (embedded ? ' is-embedded' : '') + (animateIn ? ' diet-fb-stagger-in' : '') + (compact ? ' is-copy-only' : '')}>
        <button
          type="button"
          className="diet-fb-ai-toggle"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
        >
          <span className="diet-fb-ai-badge">
            <span className="tl-period-analysis-spark" aria-hidden="true"/>
          </span>
          <span className="diet-fb-b-title">{title}</span>
          <DietAiChevron open={open}/>
        </button>
        <div className={'diet-fb-ai-panel' + (open ? ' is-open' : '')} aria-hidden={!open}>
          <div className="diet-fb-ai-panel-inner">
            <div className="diet-fb-sec-b-content">
              {children}
            </div>
            {footer}
          </div>
        </div>
      </div>
    </>
  );
}

function formatFoodTagLabel(item){
  if (typeof item === 'string') return item;
  if (item?.label) return item.label;
  if (item?.portion) return `${item.name} ${item.portion}`;
  if (item?.kcal != null) return `${item.name} ${item.kcal} kcal`;
  return item?.name || '';
}

function formatFoodItemText(item){
  if (typeof item === 'string') return item;
  const name = item?.label || item?.name || '';
  if (item?.kcal != null) return `${name} ${formatKcal(item.kcal)}千卡`;
  return name;
}

function renderMealInsightPlainCopy(insight){
  if (!insight) return null;
  if (insight.type === 'high-meal') {
    return (
      <>
        这顿约<strong>{insight.kcal}</strong>千卡，热量不低，相当于慢跑<strong>{insight.runMin}</strong>分钟，
        <span className="diet-fb-meal-insight-soft">偶尔吃一顿大餐没关系～</span>
      </>
    );
  }
  if (insight.type === 'feast') {
    return (
      <>
        这顿约<strong>{insight.kcal}</strong>千卡，热量不低，相当于慢跑<strong>{insight.runMin}</strong>分钟
      </>
    );
  }
  if (insight.type === 'just-right') {
    return <>这顿<strong>{insight.kcal}</strong>千卡，分量刚刚好。</>;
  }
  if (insight.type === 'light') {
    return <>这顿比较清淡，约<strong>{insight.kcal}</strong>千卡，注意营养要均衡哦</>;
  }
  return null;
}

function DietMealInsightBelowChart({ interpretation, insight }){
  const content = interpretation || renderMealInsightPlainCopy(insight);
  if (!content) return null;
  return (
    <p className="diet-fb-b-stats diet-fb-stagger-in">
      {content}
    </p>
  );
}

function DietMealInsightCard({ insight }){
  if (!insight) return null;

  const content = renderMealInsightPlainCopy(insight);
  if (!content) return null;

  return (
    <div className="diet-fb-meal-insight diet-fb-stagger-in">
      <div className="diet-fb-meal-insight-inner">
        <span className="diet-fb-meal-insight-icon" aria-hidden="true">{insight.icon}</span>
        <p className="diet-fb-meal-insight-text">{content}</p>
      </div>
    </div>
  );
}

function DietFoodResultSummary({
  items = [],
  totalKcal,
  revealStep = 3,
  calorieInsight = null,
  diversityCount = null,
  compact = false,
  guideBelowTotalDays = null,
  leadingIconSrc = '',
  leadingLabel = '',
  leadingHeadlineOnly = false,
  photoAboveTotalUrl = '',
  time = '',
}){
  const showDiversity = revealStep >= 1 && diversityCount != null && diversityCount >= 5;
  const showTotal = revealStep >= 1 && totalKcal != null;
  const showCalorieInsight = revealStep >= 1 && calorieInsight;
  const showFoodList = items.length > 0 && (
    leadingHeadlineOnly
      ? revealStep >= 1
      : ((compact ? revealStep >= 1 : revealStep >= 2))
  );
  const showGuideBelowTotal = revealStep >= 1 && guideBelowTotalDays != null;
  const foodListText = items.map(formatFoodItemText).filter(Boolean).join('，');
  const mealTypeLabel = resolveMealTypeFromTime(time);
  const resolvedLeadingLabel = formatDietLeadingLabel(leadingLabel, mealTypeLabel);
  const showLeadingHeadline = leadingHeadlineOnly && (leadingIconSrc || resolvedLeadingLabel);

  return (
    <div className={'diet-fb-sec-a' + (compact ? ' is-compact' : '') + (leadingHeadlineOnly ? ' has-leading-headline' : '')}>
      {showLeadingHeadline ? (
        <div className="diet-fb-food-list-row diet-fb-leading-headline diet-fb-stagger-in">
          {leadingIconSrc ? (
            <img className="diet-fb-food-list-icon" src={leadingIconSrc} alt="" aria-hidden="true" />
          ) : null}
          <p className="diet-fb-food-list diet-fb-leading-label">
            <span className="diet-fb-food-list-prefix">{resolvedLeadingLabel}</span>
          </p>
        </div>
      ) : null}
      {showTotal && photoAboveTotalUrl ? (
        <div className="diet-fb-photo-above-total diet-fb-stagger-in">
          <img src={photoAboveTotalUrl} alt="" />
        </div>
      ) : null}
      {showFoodList && leadingHeadlineOnly ? (
        <div className="diet-fb-food-list-row diet-fb-stagger-in is-detail">
          <p className="diet-fb-food-list">{foodListText}</p>
        </div>
      ) : null}
      {showFoodList && !leadingHeadlineOnly ? (
        <div className="diet-fb-food-list-row diet-fb-stagger-in">
          {leadingIconSrc ? (
            <img className="diet-fb-food-list-icon" src={leadingIconSrc} alt="" aria-hidden="true" />
          ) : null}
          <p className="diet-fb-food-list">
            {resolvedLeadingLabel ? <span className="diet-fb-food-list-prefix">{resolvedLeadingLabel}</span> : null}
            {foodListText}
          </p>
        </div>
      ) : null}
      {showTotal && (
        <p className="diet-fb-total-line diet-fb-stagger-in">
          <span className="diet-fb-total-label">总热量：</span>
          <span className="diet-fb-total-value">{formatKcal(totalKcal)} 千卡</span>
        </p>
      )}
      {showGuideBelowTotal && (
        <DietGuideBelowTotal daysWithRecord={guideBelowTotalDays}/>
      )}
      {showCalorieInsight && <DietMealInsightCard insight={calorieInsight}/>}
      {showDiversity && (
        <DietDiversityTip count={diversityCount} placement="meal"/>
      )}
    </div>
  );
}

function DietPhotoStackedPreview({
  photoUrl,
  leadingIconSrc = 'assets/quick-icon-diet.png',
  leadingLabel = '饮食：',
  time = '',
}){
  if (!photoUrl) return null;
  const displayLabel = formatDietLeadingLabel(leadingLabel, resolveMealTypeFromTime(time));
  return (
    <div className="diet-fb-sec-a has-leading-headline">
      <div className="diet-fb-food-list-row diet-fb-leading-headline">
        {leadingIconSrc ? (
          <img className="diet-fb-food-list-icon" src={leadingIconSrc} alt="" aria-hidden="true" />
        ) : null}
        <p className="diet-fb-food-list diet-fb-leading-label">
          <span className="diet-fb-food-list-prefix">{displayLabel}</span>
        </p>
      </div>
      <div className="diet-fb-photo-above-total">
        <img src={photoUrl} alt="" />
      </div>
    </div>
  );
}

function DietRecordSyncPhotoCard({
  time,
  photoUrl,
  items = [],
  totalKcal = 0,
  userContext,
  isNew = false,
  leadingIconSrc = 'assets/quick-icon-diet.png',
  leadingLabel = '饮食：',
  displayScenario: displayScenarioProp,
}){
  const ctx = userContext || {};
  const readDisplayScenario = window.readDietFeedbackDisplayScenario || (() => null);
  const displayScenario = displayScenarioProp || readDisplayScenario();
  const displayCfg = displayScenario && window.getDietFeedbackDisplayConfig
    ? window.getDietFeedbackDisplayConfig(displayScenario)
    : null;
  const showAiInsights = resolveShowAiInsights({
    showAi: true,
    displayCfg,
    hasInlineCalorieInsight: !!(displayCfg?.showMealInsight || displayCfg?.showCalorieInsightCard),
  });

  return (
    <div className={'diet-fb-card diet-fb-photo-card diet-fb-record-sync' + (isNew ? ' is-new' : '') + ' is-ready'}>
      {time && <div className="diet-fb-ts">{time}</div>}
      <DietFoodResultSummary
        items={items}
        totalKcal={totalKcal}
        revealStep={3}
        leadingIconSrc={leadingIconSrc}
        leadingLabel={leadingLabel}
        leadingHeadlineOnly
        photoAboveTotalUrl={photoUrl}
        time={time}
      />
      {showAiInsights ? (
        <DietAiInsightsShell displayScenario={displayScenario} isNew={isNew}>
          <DietCalorieAiBody
            weekData={ctx.weekData || []}
            todayKcal={ctx.dayTotalKcal || totalKcal}
            daysWithRecord={ctx.daysWithRecord || 0}
            avgKcal={ctx.avgKcal}
            dayMealCount={ctx.dayMealCount || 2}
            dayTotalKcal={ctx.dayTotalKcal ?? 1100}
            mealKcal={totalKcal ?? 700}
            displayScenario={displayScenario}
            cycleData={ctx.cycleData}
            todayFoodCount={ctx.todayFoodCount ?? 0}
            time={time}
            foods={foods}
            items={items}
            foodTags={foodTags}
          />
        </DietAiInsightsShell>
      ) : null}
    </div>
  );
}

function DietSecALoading(){
  return (
    <div className="diet-fb-sec-a diet-fb-sec-loading" aria-hidden="true">
      <div className="diet-fb-skeleton-food-list">
        <div className="diet-fb-skeleton-line lg"/>
        <div className="diet-fb-skeleton-line md"/>
      </div>
      <div className="diet-fb-skeleton-total">
        <div className="diet-fb-skeleton-line xs"/>
      </div>
    </div>
  );
}

function DietSecAPhotoResult(props){
  return <DietFoodResultSummary {...props}/>;
}

function DietSecBLoading(){
  return (
    <div className="diet-fb-sec-b diet-fb-sec-loading" aria-live="polite">
      <div className="diet-fb-b-header diet-fb-ai-loading-line">
        <span className="diet-fb-ai-badge">
          <span className="tl-period-analysis-spark" aria-hidden="true"/>
        </span>
      </div>
      <div className="diet-fb-recog">
        <span className="diet-fb-recog-dot"/>
        <span className="diet-fb-recog-dot"/>
        <span className="diet-fb-recog-dot"/>
        <span className="diet-fb-recog-text">识别中</span>
      </div>
    </div>
  );
}

function DietSecErrorRetry({ onRetry, showRetry, retrying }){
  return (
    <div className="diet-fb-sec-a diet-fb-sec-error">
      <div className="diet-fb-error-row">
        <span className="diet-fb-error-text">AI识别遇到点小问题</span>
        {showRetry && (
          <button
            type="button"
            className="diet-fb-retry-btn"
            onClick={onRetry}
            disabled={retrying}
          >
            重试
          </button>
        )}
      </div>
    </div>
  );
}

function DietPhotoFeedbackCard({
  photoUrl,
  data,
  userContext,
  isNew = false,
  onAnalysisComplete,
  recognitionScenario: recognitionScenarioProp,
  recognitionState: recognitionStateProp,
  failureCount: failureCountProp = 0,
  displayScenario: displayScenarioProp,
  leadingIconSrc = '',
  leadingLabel = '',
}){
  if (data?.fromRecordSync) {
    return (
      <DietRecordSyncPhotoCard
        time={data?.time}
        photoUrl={photoUrl}
        items={data?.items || []}
        totalKcal={data?.totalKcal || 0}
        userContext={userContext}
        isNew={isNew}
        leadingIconSrc={leadingIconSrc || 'assets/quick-icon-diet.png'}
        leadingLabel={leadingLabel || '饮食：'}
        displayScenario={displayScenarioProp}
      />
    );
  }

  const loadingMs = window.PHOTO_ANALYZE_LOADING_MS || 5000;
  const readScenario = window.readDietRecognitionScenario || (() => 'success');
  const readDisplayScenario = window.readDietFeedbackDisplayScenario || (() => null);
  const resolveMaxFailures = window.getDietRecognitionMaxFailures || (() => 5);
  const mockRecognize = window.mockRecognizeDietPhoto || (() => ({ ok: true }));
  const activeScenario = recognitionScenarioProp || readScenario();
  const maxFailures = resolveMaxFailures(activeScenario);

  const initialPhase = (() => {
    if (recognitionStateProp === 'error') return 'error';
    if (recognitionStateProp === 'ready') return 'ready';
    if (isNew) return 'loading';
    return 'ready';
  })();

  const [phase, setPhase] = React.useState(initialPhase);
  const [revealStep, setRevealStep] = React.useState(() => {
    if (initialPhase === 'ready' && recognitionStateProp !== 'ready') return 3;
    return 0;
  });
  const [failureCount, setFailureCount] = React.useState(
    recognitionStateProp === 'error' ? Math.max(0, failureCountProp) : 0
  );
  const recognizeTimerRef = React.useRef(null);
  const revealTimersRef = React.useRef([]);
  const finishRecognitionRef = React.useRef(null);

  const {
    time,
    foods = [],
    items = [],
    totalKcal,
    matchStatus = 'all',
    foodTags = [],
  } = data || {};
  const ctx = userContext || {};

  const clearRevealTimers = React.useCallback(() => {
    revealTimersRef.current.forEach((id) => window.clearTimeout(id));
    revealTimersRef.current = [];
  }, []);

  const startSuccessReveal = React.useCallback(() => {
    clearRevealTimers();
    setRevealStep(1);
    revealTimersRef.current.push(window.setTimeout(() => setRevealStep(2), 420));
    revealTimersRef.current.push(window.setTimeout(() => {
      setRevealStep(3);
      onAnalysisComplete?.();
      requestAnimationFrame(() => {
        if (typeof window.scrollTimelineToBottom === 'function') {
          window.scrollTimelineToBottom('smooth');
        }
      });
    }, 840));
  }, [clearRevealTimers, onAnalysisComplete]);

  const finishRecognition = React.useCallback((result, { forceSuccess = false, isRetry = false } = {}) => {
    const scenario = readScenario();
    const ok = result?.ok ?? mockRecognize({ scenario, forceSuccess }).ok;

    if (ok) {
      setFailureCount(0);
      setPhase('ready');
      startSuccessReveal();
      return;
    }

    setPhase('error');
    if (isRetry) {
      setFailureCount((count) => count + 1);
    }
    setRevealStep(0);
  }, [mockRecognize, readScenario, startSuccessReveal]);

  finishRecognitionRef.current = finishRecognition;

  const runRecognition = React.useCallback((options = {}) => {
    if (recognizeTimerRef.current) {
      window.clearTimeout(recognizeTimerRef.current);
    }
    setPhase('loading');
    setRevealStep(0);
    recognizeTimerRef.current = window.setTimeout(() => {
      recognizeTimerRef.current = null;
      const scenario = readScenario();
      const result = mockRecognize({ scenario, forceSuccess: options.forceSuccess });
      finishRecognitionRef.current?.(result, options);
    }, loadingMs);
  }, [loadingMs, mockRecognize, readScenario]);

  React.useEffect(() => {
    if (!isNew) return undefined;
    if (recognitionStateProp === 'ready') {
      startSuccessReveal();
      return () => clearRevealTimers();
    }
    if (recognitionStateProp === 'error') return undefined;
    runRecognition();
    return () => {
      if (recognizeTimerRef.current) {
        window.clearTimeout(recognizeTimerRef.current);
        recognizeTimerRef.current = null;
      }
      clearRevealTimers();
    };
  // 仅在新卡片挂载时触发一次，避免 revealStep 变化导致重复识别
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, recognitionStateProp]);

  const handleRetry = React.useCallback((event) => {
    if (phase === 'loading' || failureCount >= maxFailures) return;
    const forceSuccess = !!(event?.altKey || event?.metaKey);
    runRecognition({ forceSuccess, isRetry: true });
  }, [failureCount, maxFailures, phase, runRecognition]);

  const dietIcon = leadingIconSrc || 'assets/quick-icon-diet.png';
  const dietLabel = leadingLabel || '饮食：';
  const useStackedPhoto = !!photoUrl;

  if (matchStatus === 'fail') {
    return (
      <div className={'diet-fb-card diet-fb-photo-card' + (useStackedPhoto ? ' is-stacked-photo' : '') + (isNew ? ' is-new' : '')}>
        {time && <div className="diet-fb-ts">{time}</div>}
        {useStackedPhoto ? (
          <DietPhotoStackedPreview photoUrl={photoUrl} leadingIconSrc={dietIcon} leadingLabel={dietLabel} time={time} />
        ) : photoUrl ? (
          <div className="diet-fb-photo-wrap">
            <img src={photoUrl} alt="" className="diet-fb-photo"/>
          </div>
        ) : null}
        <DietSecFail/>
      </div>
    );
  }

  const interpretation = revealStep >= 3 ? getCalorieInterpretation(totalKcal) : null;
  const cycleInsight = revealStep >= 3 ? getCycleInsight(ctx.cycleData, foodTags) : null;
  const isLoading = phase === 'loading';
  const isError = phase === 'error';
  const isExhausted = isError && failureCount >= maxFailures;
  const showAi = phase === 'ready' && revealStep >= 3;
  const showErrorAction = isError && failureCount < maxFailures;
  const displayScenario = displayScenarioProp || readDisplayScenario();
  const displayCfg = displayScenario && window.getDietFeedbackDisplayConfig
    ? window.getDietFeedbackDisplayConfig(displayScenario)
    : null;
  const usesFeedbackDim = !!(displayCfg?.feedbackDim || displayCfg?.feedbackDims?.length);
  const calorieInsight = !usesFeedbackDim && revealStep >= 1
    ? resolveCalorieInsightBelowTotal(totalKcal, displayCfg)
    : null;
  const diversityCount = shouldShowMealDiversity(displayCfg) && revealStep >= 1
    ? (ctx.todayFoodCount ?? 0)
    : null;
  const guideBelowTotalDays = shouldShowGuideBelowTotal(displayCfg) && revealStep >= 1
    ? (ctx.daysWithRecord ?? 0)
    : null;
  const hasInlineCalorieInsight = !!(displayCfg?.showMealInsight || displayCfg?.showCalorieInsightCard);
  const showAiInsights = resolveShowAiInsights({ showAi, displayCfg, hasInlineCalorieInsight });
  const mealInterpretation = !usesFeedbackDim && showAiInsights && !hasInlineCalorieInsight
    ? interpretation
    : null;
  const chartMealInterpretation = mealInterpretation;
  const chartMealCalorieInsight = !usesFeedbackDim && showAiInsights && hasInlineCalorieInsight
    ? calorieInsight
    : null;
  const sectionACalorieInsight = showAiInsights ? null : calorieInsight;

  return (
    <>
      <div className={'diet-fb-card diet-fb-photo-card' + (useStackedPhoto ? ' is-stacked-photo' : '') + (isNew ? ' is-new' : '') + (isLoading ? ' is-loading' : '') + (isError ? ' is-error' : '') + (isExhausted ? ' is-exhausted' : '') + (phase === 'ready' ? ' is-ready' : '')}>
        {time && <div className="diet-fb-ts">{time}</div>}
        {!useStackedPhoto && photoUrl && (
          <div className="diet-fb-photo-wrap">
            <img src={photoUrl} alt="" className="diet-fb-photo"/>
          </div>
        )}
        {useStackedPhoto && (isLoading || isError) && (
          <DietPhotoStackedPreview photoUrl={photoUrl} leadingIconSrc={dietIcon} leadingLabel={dietLabel} time={time} />
        )}
        {isLoading && <DietSecALoading/>}
        {phase === 'ready' && revealStep >= 1 && (
          <DietSecAPhotoResult
            items={items}
            totalKcal={totalKcal}
            revealStep={revealStep}
            calorieInsight={sectionACalorieInsight}
            diversityCount={diversityCount}
            compact={!!displayCfg?.useCompactMeal}
            guideBelowTotalDays={guideBelowTotalDays}
            leadingIconSrc={dietIcon}
            leadingLabel={dietLabel}
            leadingHeadlineOnly={useStackedPhoto}
            photoAboveTotalUrl={useStackedPhoto ? photoUrl : ''}
            time={time}
          />
        )}
        {isLoading && (
          <>
            <div className="diet-fb-divider"/>
            <DietSecBLoading/>
          </>
        )}
        {showErrorAction && (
          <DietSecErrorRetry
            onRetry={handleRetry}
            showRetry
            retrying={false}
          />
        )}
        {showAiInsights && (
          <DietAiInsightsShell displayScenario={displayScenario} isNew={isNew}>
            <DietCalorieAiBody
              weekData={ctx.weekData || []}
              todayKcal={ctx.dayTotalKcal || totalKcal}
              daysWithRecord={ctx.daysWithRecord || 0}
              avgKcal={ctx.avgKcal}
              dayMealCount={ctx.dayMealCount || 2}
              dayTotalKcal={ctx.dayTotalKcal ?? 1100}
              mealKcal={totalKcal ?? 700}
              displayScenario={displayScenario}
              cycleData={ctx.cycleData}
              todayFoodCount={ctx.todayFoodCount ?? 0}
              time={time}
              foods={foods}
              items={items}
              foodTags={foodTags}
              mealInterpretation={chartMealInterpretation}
              mealCalorieInsight={chartMealCalorieInsight}
            />
          </DietAiInsightsShell>
        )}
        {showAiInsights && cycleInsight && !displayCfg?.showCycleTip && !usesFeedbackDim && (
          <>
            <div className="diet-fb-divider"/>
            <div className="diet-fb-stagger-in">
              <DietSecD {...cycleInsight}/>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function DietTextFeedbackCard({
  sourceText,
  sourceVoice,
  data,
  userContext,
  isNew = false,
  displayScenario: displayScenarioProp,
  leadingIconSrc = '',
  leadingLabel = '',
}){
  const {
    time,
    items = [],
    totalKcal,
    matchStatus = 'all',
    foodTags = [],
  } = data || {};
  const ctx = userContext || {};
  const readDisplayScenario = window.readDietFeedbackDisplayScenario || (() => null);
  const displayScenario = displayScenarioProp || readDisplayScenario();
  const showCalories = matchStatus !== 'names-only' && totalKcal != null;
  const TlVoiceInline = window.TlVoiceInline;

  const [revealStep, setRevealStep] = React.useState(isNew ? 0 : 3);

  React.useEffect(() => {
    if (!isNew) return undefined;
    if (showCalories) {
      setRevealStep(1);
      const tagsTimer = window.setTimeout(() => setRevealStep(2), 420);
      const aiTimer = window.setTimeout(() => setRevealStep(3), 840);
      return () => {
        window.clearTimeout(tagsTimer);
        window.clearTimeout(aiTimer);
      };
    }
    const tagsTimer = window.setTimeout(() => setRevealStep(2), 280);
    return () => window.clearTimeout(tagsTimer);
  }, [isNew, showCalories]);

  const tagItems = showCalories
    ? items
    : items.map((item) => (typeof item === 'string' ? item : (item.label || item.name)));
  const displayCfg = displayScenario && window.getDietFeedbackDisplayConfig
    ? window.getDietFeedbackDisplayConfig(displayScenario)
    : null;
  const usesFeedbackDim = !!(displayCfg?.feedbackDim || displayCfg?.feedbackDims?.length);
  const calorieInsight = !usesFeedbackDim && revealStep >= 1 && showCalories
    ? resolveCalorieInsightBelowTotal(totalKcal, displayCfg)
    : null;
  const diversityCount = shouldShowMealDiversity(displayCfg) && revealStep >= 1 && showCalories
    ? (ctx.todayFoodCount ?? 0)
    : null;
  const guideBelowTotalDays = shouldShowGuideBelowTotal(displayCfg) && revealStep >= 1 && showCalories
    ? (ctx.daysWithRecord ?? 0)
    : null;
  const hasInlineCalorieInsight = !!(displayCfg?.showMealInsight || displayCfg?.showCalorieInsightCard);
  const showAiInsights = resolveShowAiInsights({
    showAi: showCalories && revealStep >= 3,
    displayCfg,
    hasInlineCalorieInsight,
  });
  const interpretation = !usesFeedbackDim && showAiInsights && !hasInlineCalorieInsight
    ? getCalorieInterpretation(totalKcal)
    : null;
  const chartMealInterpretation = interpretation;
  const chartMealCalorieInsight = !usesFeedbackDim && showAiInsights && hasInlineCalorieInsight
    ? calorieInsight
    : null;
  const sectionACalorieInsight = showAiInsights ? null : calorieInsight;

  return (
    <>
      <div className={'diet-fb-card diet-fb-text-card' + (isNew ? ' is-new' : '') + (showCalories ? ' is-ready' : ' is-names-only')}>
        {time && <div className="diet-fb-ts">{time}</div>}
        {sourceVoice && TlVoiceInline ? (
          <div className="diet-fb-source-voice">
            <TlVoiceInline voice={sourceVoice} text={sourceText}/>
          </div>
        ) : sourceText ? (
          <p className="diet-fb-source-text">{sourceText}</p>
        ) : null}
        <DietFoodResultSummary
          items={tagItems}
          totalKcal={showCalories ? totalKcal : null}
          revealStep={revealStep}
          calorieInsight={sectionACalorieInsight}
          diversityCount={diversityCount}
          compact={!!displayCfg?.useCompactMeal}
          guideBelowTotalDays={guideBelowTotalDays}
          leadingIconSrc={leadingIconSrc}
          leadingLabel={leadingLabel}
          time={time}
        />
        {showAiInsights && (
          <DietAiInsightsShell displayScenario={displayScenario} isNew={isNew}>
            <DietCalorieAiBody
              weekData={ctx.weekData || []}
              todayKcal={ctx.dayTotalKcal || totalKcal}
              daysWithRecord={ctx.daysWithRecord || 0}
              avgKcal={ctx.avgKcal}
              dayMealCount={ctx.dayMealCount || 2}
              dayTotalKcal={ctx.dayTotalKcal ?? 1100}
              mealKcal={totalKcal ?? 700}
              displayScenario={displayScenario}
              cycleData={ctx.cycleData}
              todayFoodCount={ctx.todayFoodCount ?? 0}
              time={time}
              items={items}
              foodTags={foodTags}
              mealInterpretation={chartMealInterpretation}
              mealCalorieInsight={chartMealCalorieInsight}
            />
          </DietAiInsightsShell>
        )}
      </div>
    </>
  );
}

// ===== 维度A：识别结果卡片 =====
function DietSecA({ foods, totalKcal, items, dayMealCount, dayTotalKcal, matchStatus }){
  const foodsText = foods.join(' · ');
  
  return (
    <div className="diet-fb-sec-a">
      <div className="diet-fb-foods">🍽️ {foodsText}</div>
      {matchStatus === 'all' && totalKcal != null && (
        <div className="diet-fb-kcal">合计约 <b>{formatKcal(totalKcal)} kcal</b></div>
      )}
      {matchStatus === 'partial' && totalKcal != null && (
        <div className="diet-fb-kcal">已匹配食物合计约 <b>{formatKcal(totalKcal)} kcal</b></div>
      )}
      {matchStatus === 'none' && (
        <div className="diet-fb-kcal">已记录</div>
      )}
      
      {/* 食物明细 */}
      {items && items.length > 0 && (
        <div className="diet-fb-detail">
          {items.map((item, i) => (
            <div key={i} className="diet-fb-item">
              <span className={`name${item.matched === false ? ' unmatch' : ''}`}>{item.name}</span>
              {item.kcal != null && <span className="kcal">约 {item.kcal} kcal</span>}
            </div>
          ))}
        </div>
      )}
      
      {/* 当日汇总 */}
      {dayMealCount >= 2 && dayTotalKcal != null && (
        <div className="diet-fb-day-total">
          今天已记录 {dayMealCount} 餐，合计约 <b>{formatKcal(dayTotalKcal)} kcal</b>
        </div>
      )}
    </div>
  );
}

// ===== 维度B：7日趋势 =====
function DietSecB({ weekData, todayKcal, daysWithRecord, avgKcal, defaultOpen = true }){
  const DietCalorieReviewEntry = window.DietCalorieReviewEntry;
  return (
    <DietAiCollapsibleSection
      defaultOpen={defaultOpen}
      footer={DietCalorieReviewEntry ? <DietCalorieReviewEntry/> : null}
    >
      <DietCalorieAiBody
        weekData={weekData}
        todayKcal={todayKcal}
        daysWithRecord={daysWithRecord}
        avgKcal={avgKcal}
      />
    </DietAiCollapsibleSection>
  );
}

// ===== 维度C：热量解读 =====
function DietSecC({ kcal, interpretation }){
  if(!interpretation) return null;
  return (
    <div className="diet-fb-outer-text">{interpretation}</div>
  );
}

// ===== 维度D：周期关联 =====
function DietSecD({ type, text, subText }){
  const iconMap = {
    'iron-suggest': { icon: '🩸', cls: 'cycle' },
    'iron-confirm': { icon: '👍', cls: 'good' },
    'cold-warn': { icon: '🧊', cls: 'tip' },
    'luteal-sweet': { icon: '🍬', cls: 'tip' },
  };
  const { icon, cls } = iconMap[type] || { icon: '💡', cls: 'tip' };
  
  return (
    <div className="diet-fb-sec-insight">
      <div className="diet-fb-insight-line">
        <div className={`diet-fb-ins-icon ${cls}`}>{icon}</div>
        <div className="diet-fb-ins-text">
          {text}
          {subText && <span className="diet-fb-ins-sub">{subText}</span>}
        </div>
      </div>
    </div>
  );
}

// ===== 维度E：饮食多样性 =====
function DietSecE({ count }){
  if(count < 5) return null;
  return (
    <div className="diet-fb-diversity">
      <div className="diet-fb-diversity-text">
        今天吃了 {count} 种食物，饮食多样性不错 👍
      </div>
    </div>
  );
}

// ===== 维度F：里程碑 =====
function DietSecF({ days, milestone }){
  const milestoneText = {
    7: '已经连续记录 7 天饮食了！坚持记录能帮你更好地了解自己的饮食习惯 🎉',
    30: '饮食记录满 30 天！你对自己的饮食习惯已经有很好的了解了 📊',
    100: '饮食记录满 100 天，这份坚持本身就值得为自己鼓掌 💪',
  };
  
  if(!milestoneText[milestone]) return null;
  
  return (
    <div className="diet-fb-milestone">
      <div className="diet-fb-milestone-text">
        {milestoneText[milestone]}
      </div>
    </div>
  );
}

// ===== 识别失败 =====
function DietSecFail(){
  return (
    <div className="diet-fb-fail">
      <div className="diet-fb-fail-text">没有识别到食物，试试拍清晰一点？</div>
      <div className="diet-fb-fail-hint">确保食物在画面中清晰可见</div>
    </div>
  );
}

// ===== 热量解读规则 =====
function getCalorieInterpretation(kcal){
  if(kcal == null) return null;
  if(kcal < 300){
    return `这顿比较清淡，约${formatKcal(kcal)}千卡，注意营养要均衡哦`;
  }
  if(kcal >= 300 && kcal <= 700){
    return `这顿${formatKcal(kcal)}千卡，分量刚刚好。`;
  }
  if(kcal > 700){
    const runMin = roundRunMinutes(kcal);
    return `这顿约${formatKcal(kcal)}千卡，热量不低，相当于慢跑${runMin}分钟`;
  }
  return null;
}

function getMealCalorieInsight(kcal){
  if(kcal == null) return null;
  return {
    type: 'high-meal',
    icon: '🏃‍♀️',
    kcal: formatKcal(kcal),
    runMin: roundRunMinutes(kcal),
  };
}

function getCalorieInsightCard(kcal){
  if(kcal == null) return null;
  if(kcal < 300){
    return {
      type: 'light',
      icon: '🥗',
      kcal: formatKcal(kcal),
    };
  }
  if(kcal >= 700){
    return {
      type: 'feast',
      icon: '🍽️',
      kcal: formatKcal(kcal),
      runMin: roundRunMinutes(kcal),
    };
  }
  return {
    type: 'just-right',
    icon: '🍽️',
    kcal: formatKcal(kcal),
  };
}

function resolveCalorieInsightBelowTotal(totalKcal, displayCfg){
  if(!displayCfg || totalKcal == null) return null;
  if(displayCfg.showMealInsight) return getMealCalorieInsight(totalKcal);
  if(displayCfg.showCalorieInsightCard) return getCalorieInsightCard(totalKcal);
  return null;
}

// ===== 周期关联规则 =====
function getCycleInsight(cycleData, foodTags){
  if(!cycleData) return null;
  
  const { phase, day } = cycleData;
  const hasIronFood = foodTags?.includes('含铁食物');
  const hasColdDrink = foodTags?.includes('冷饮冰品');
  const hasSweetFood = foodTags?.includes('甜食高糖');
  
  if(phase === 'period'){
    if(hasColdDrink){
      return {
        type: 'cold-warn',
        text: '经期吃冷饮因人而异，如果你容易痛经，减少冷饮可能会舒服一些',
        subText: `当前经期第 ${day} 天`,
      };
    }
    if(hasIronFood){
      const ironName = resolveIronFoodName({ foodTags, fallback:'菠菜' });
      return {
        type: 'iron-confirm',
        text: `经期吃${ironName}很不错，有助于补充铁元素`,
        subText: `当前经期第 ${day} 天`,
      };
    }
    return {
      type: 'iron-suggest',
      text: '经期可以适当多吃些含铁食物，比如红肉、菠菜、黑木耳，帮助补充流失的铁元素',
      subText: `当前经期第 ${day} 天`,
    };
  }
  
  if(phase === 'luteal-late' && hasSweetFood){
    return {
      type: 'luteal-sweet',
      text: '黄体期特别想吃甜食是很正常的，和孕激素波动有关。适量满足不用有负罪感～',
      subText: null,
    };
  }
  
  return null;
}

// ===== 主反馈卡片组件 =====
function DietFeedbackCard({ 
  data, 
  userContext,
  isNew = false,
  isStream = false,
}){
  const {
    time,
    foods = [],
    items = [],
    totalKcal,
    matchStatus = 'all', // 'all' | 'partial' | 'none' | 'fail'
    foodTags = [],
  } = data || {};
  
  const {
    dayMealCount = 1,
    dayTotalKcal,
    weekData = [null, null, null, null, null, null, null],
    daysWithRecord = 0,
    avgKcal,
    cycleData,
    todayFoodCount = 1,
    totalRecordDays = 1,
    newMilestone,
  } = userContext || {};
  
  // 识别失败
  if(matchStatus === 'fail'){
    return (
      <div className={`diet-fb-card${isNew ? ' is-new' : ''}`}>
        <DietSecFail/>
      </div>
    );
  }
  
  // 收集所有维度
  const sections = [];
  
  // 维度A：识别结果（必展示）
  sections.push({
    priority: 'A',
    render: () => (
      <DietSecA 
        key="sec-a"
        foods={foods}
        totalKcal={totalKcal}
        items={items}
        dayMealCount={dayMealCount}
        dayTotalKcal={dayTotalKcal}
        matchStatus={matchStatus}
      />
    ),
  });
  
  // 维度B：趋势图/引导
  sections.push({
    priority: 'B',
    render: () => (
      <DietSecB
        key="sec-b"
        weekData={weekData}
        todayKcal={dayTotalKcal || totalKcal}
        daysWithRecord={daysWithRecord}
        avgKcal={avgKcal}
      />
    ),
  });
  
  // 维度C：热量解读
  const interpretation = getCalorieInterpretation(totalKcal);
  if(interpretation){
    sections.push({
      priority: 'C',
      isOuter: true,
      render: () => <DietSecC key="sec-c" kcal={totalKcal} interpretation={interpretation}/>,
    });
  }
  
  // 维度D：周期关联
  const cycleInsight = getCycleInsight(cycleData, foodTags);
  if(cycleInsight){
    sections.push({
      priority: 'D',
      render: () => (
        <React.Fragment key="sec-d">
          <div className="diet-fb-divider"/>
          <DietSecD {...cycleInsight}/>
        </React.Fragment>
      ),
    });
  }
  
  // 维度E：饮食多样性
  if(todayFoodCount >= 5){
    sections.push({
      priority: 'E',
      render: () => (
        <React.Fragment key="sec-e">
          <div className="diet-fb-divider"/>
          <DietSecE count={todayFoodCount}/>
        </React.Fragment>
      ),
    });
  }
  
  // 维度F：里程碑
  if(newMilestone){
    sections.push({
      priority: 'F',
      render: () => (
        <React.Fragment key="sec-f">
          <div className="diet-fb-divider"/>
          <DietSecF days={totalRecordDays} milestone={newMilestone}/>
        </React.Fragment>
      ),
    });
  }
  
  // 按优先级排序，最多展示3个维度
  const cardSections = sections.filter(s => !s.isOuter).slice(0, 3);
  const outerSections = sections.filter(s => s.isOuter).slice(0, Math.max(0, 3 - cardSections.length));
  
  return (
    <>
      <div className={`diet-fb-card${isNew ? ' is-new' : ''}${isStream ? ' is-stream' : ''}`}>
        {time && <div className="diet-fb-ts">{time}</div>}
        {cardSections.map(s => s.render())}
      </div>
      {outerSections.map(s => s.render())}
    </>
  );
}

// ===== 示例数据生成 =====
function createDietFeedbackDemo(scenario){
  if(scenario === 'mature'){
    // 成熟用户：经期 + 多天记录
    return {
      data: {
        time: '12:35',
        foods: ['米饭', '红烧肉', '炒青菜'],
        items: [
          { name: '米饭（一碗）', kcal: 230 },
          { name: '红烧肉', kcal: 350 },
          { name: '炒青菜', kcal: 100 },
        ],
        totalKcal: 680,
        matchStatus: 'all',
        foodTags: [],
      },
      userContext: {
        dayMealCount: 2,
        dayTotalKcal: 980,
        weekData: [1420, null, 1680, null, 1250, 1560, null],
        daysWithRecord: 5,
        avgKcal: 1380,
        cycleData: { phase: 'period', day: 2 },
        todayFoodCount: 6,
        totalRecordDays: 15,
      },
    };
  }
  
  if(scenario === 'medium'){
    // 中等用户：无经期 + 高热量食物
    return {
      data: {
        time: '15:20',
        foods: ['珍珠奶茶（大杯）'],
        items: [
          { name: '珍珠奶茶（大杯）', kcal: 520 },
        ],
        totalKcal: 520,
        matchStatus: 'all',
        foodTags: ['甜食高糖'],
      },
      userContext: {
        dayMealCount: 1,
        dayTotalKcal: 520,
        weekData: [null, 1350, null, null, 890, null, null],
        daysWithRecord: 3,
        avgKcal: null,
        cycleData: null,
        todayFoodCount: 1,
        totalRecordDays: 8,
      },
    };
  }
  
  if(scenario === 'new'){
    // 新用户：首次记录
    return {
      data: {
        time: '19:45',
        foods: ['番茄鸡蛋面'],
        items: [
          { name: '番茄鸡蛋面', kcal: 420 },
        ],
        totalKcal: 420,
        matchStatus: 'all',
        foodTags: [],
      },
      userContext: {
        dayMealCount: 1,
        dayTotalKcal: 420,
        weekData: [null, null, null, null, null, null, null],
        daysWithRecord: 1,
        avgKcal: null,
        cycleData: null,
        todayFoodCount: 1,
        totalRecordDays: 1,
      },
    };
  }
  
  return null;
}

// ===== 创建时间轴饮食反馈条目 =====
function createDietFeedbackEntry(options){
  const {
    id,
    time,
    foods,
    items,
    totalKcal,
    matchStatus = 'all',
    foodTags = [],
    userContext = {},
  } = options;
  
  return {
    id: id || `diet-fb-${Date.now()}`,
    kind: 'diet-feedback',
    time,
    dietData: {
      time,
      foods,
      items,
      totalKcal,
      matchStatus,
      foodTags,
    },
    userContext,
    isNew: true,
  };
}

// ===== 模拟饮食识别结果 =====
function simulateDietRecognition(photoDescription){
  const foodPatterns = [
    { pattern: /米饭|白饭/, name: '米饭（一碗）', kcal: 230 },
    { pattern: /红烧肉/, name: '红烧肉', kcal: 350 },
    { pattern: /青菜|蔬菜|炒菜/, name: '炒青菜', kcal: 100 },
    { pattern: /奶茶/, name: '珍珠奶茶（大杯）', kcal: 520, tags: ['甜食高糖'] },
    { pattern: /面|面条/, name: '番茄鸡蛋面', kcal: 420 },
    { pattern: /鸡蛋|蛋/, name: '煎蛋', kcal: 90 },
    { pattern: /牛奶/, name: '牛奶', kcal: 120, tags: ['含钙食物'] },
    { pattern: /菠菜/, name: '菠菜', kcal: 50, tags: ['含铁食物'] },
    { pattern: /冰淇淋|雪糕/, name: '冰淇淋', kcal: 280, tags: ['冷饮冰品', '甜食高糖'] },
    { pattern: /沙拉/, name: '蔬菜沙拉', kcal: 180 },
    { pattern: /汉堡/, name: '牛肉汉堡', kcal: 650 },
    { pattern: /薯条/, name: '薯条', kcal: 380 },
  ];
  
  const recognized = [];
  const tags = new Set();
  
  foodPatterns.forEach(fp => {
    if(fp.pattern.test(photoDescription)){
      recognized.push({
        name: fp.name,
        kcal: fp.kcal,
        matched: true,
      });
      (fp.tags || []).forEach(t => tags.add(t));
    }
  });
  
  if(recognized.length === 0){
    return { matchStatus: 'fail', foods: [], items: [], totalKcal: null, foodTags: [] };
  }
  
  const totalKcal = recognized.reduce((sum, r) => sum + r.kcal, 0);
  const foods = recognized.map(r => r.name.replace(/（.*）/, ''));
  
  return {
    matchStatus: 'all',
    foods,
    items: recognized,
    totalKcal,
    foodTags: Array.from(tags),
  };
}

// 导出到全局
Object.assign(window, {
  DietFeedbackCard,
  DietPhotoFeedbackCard,
  DietTextFeedbackCard,
  DietFoodResultSummary,
  DietPhotoStackedPreview,
  resolveMealTypeFromTime,
  DietAiInsightsShell,
  DietAiCollapsibleSection,
  DietCalorieAiBody,
  DietAiChevron,
  DietTrendChart,
  buildDietFeedbackLongCopy,
  resolveIronFoodName,
  DietSecA,
  DietSecB,
  DietSecC,
  DietSecD,
  DietSecE,
  DietSecF,
  createDietFeedbackDemo,
  createDietFeedbackEntry,
  simulateDietRecognition,
  getCalorieInterpretation,
  getMealCalorieInsight,
  getCycleDietTipDisplay,
  getCycleInsight,
});
