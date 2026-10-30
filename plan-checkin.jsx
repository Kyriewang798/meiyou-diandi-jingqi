// 今日计划打卡：体重管理二级页 ⇄ 点滴 tab 的打卡闭环
// - store：记录今天哪些计划项已打卡（演示用，内存态，刷新即重置）
// - PlanCheckInContext：时间轴卡片由 TimelineItem 包一层，卡片底部入口据此换成「计划进度」反馈
const PLAN_CHECKIN_EVENT = 'weightPlanCheckInChange';

const planCheckInStore = (()=>{
  let checked = { free:new Set(), paid:new Set() };
  let lastChecked = null; // {planType, taskId, at}
  const emit = ()=>window.dispatchEvent(new CustomEvent(PLAN_CHECKIN_EVENT));
  return {
    isChecked(planType, taskId){ return !!checked[planType]?.has(taskId); },
    check(planType, taskId){
      if(!checked[planType]) checked[planType] = new Set();
      checked[planType].add(taskId);
      lastChecked = { planType, taskId, at:Date.now() };
      emit();
    },
    consumeLastChecked(planType){
      if(!lastChecked || lastChecked.planType !== planType) return null;
      const id = lastChecked.taskId;
      lastChecked = null;
      return id;
    },
    peekLastChecked(){ return lastChecked; },
    reset(){ checked = { free:new Set(), paid:new Set() }; lastChecked = null; emit(); },
  };
})();

function usePlanCheckInVersion(){
  const [version, setVersion] = React.useState(0);
  React.useEffect(()=>{
    const bump = ()=>setVersion(v=>v + 1);
    window.addEventListener(PLAN_CHECKIN_EVENT, bump);
    return ()=>window.removeEventListener(PLAN_CHECKIN_EVENT, bump);
  }, []);
  return version;
}

function getWeightPlanTasks(planType){
  const list = planType === 'paid' ? window.WEIGHT_GOAL_PAID_PLAN_TASKS : window.WEIGHT_GOAL_WEEK_PLAN_TASKS;
  return (list || []).map(item=>({
    ...item,
    done: !!item.done || planCheckInStore.isChecked(planType, item.id),
  }));
}

// 计划项 → 点滴里要拉起的记录方式
function resolvePlanCheckInKind(task){
  if(!task) return null;
  if(task.checkKind) return task.checkKind;
  const id = String(task.id || '');
  if(/weight|wt/.test(id)) return 'weight';
  if(/walk|ex|run|sport/.test(id)) return 'exercise';
  return 'diet';
}

const PlanCheckInContext = React.createContext(null);
function usePlanCheckIn(){ return React.useContext(PlanCheckInContext); }

function planTaskShortTitle(task){
  return String(task?.title || '').split(' · ')[0];
}

function PlanCheckInFeedback(){
  const ctx = usePlanCheckIn();
  usePlanCheckInVersion();
  if(!ctx) return null;
  const tasks = getWeightPlanTasks(ctx.planType);
  const total = tasks.length;
  const doneCount = tasks.filter(t=>t.done).length;
  const current = tasks.find(t=>t.id === ctx.taskId);
  const remaining = tasks.filter(t=>!t.done);
  const allDone = remaining.length === 0;
  const lead = current ? (planTaskShortTitle(current) + '已打卡') : '已打卡';
  const tail = allDone
    ? '今天的计划全部完成啦'
    : ('还差' + remaining.slice(0, 2).map(planTaskShortTitle).join('、') + (remaining.length > 2 ? ' 等' + remaining.length + '项' : ''));
  return (
    <button
      type="button"
      className={'plan-ci-feedback' + (allDone ? ' is-all-done' : '')}
      onClick={(e)=>{
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('openReviewWeightGoalDetail', {
          detail:{ returnTab:'note', fromPlanCheckIn:ctx.taskId },
        }));
      }}
      aria-label={'今日计划已完成 ' + doneCount + '/' + total + '，回到体重管理'}
    >
      <span className="plan-ci-feedback-main">
        <span className="plan-ci-feedback-top">
          <span className="plan-ci-feedback-badge" aria-hidden="true">✓</span>
          <b>今日计划</b>
          <span className="plan-ci-feedback-count"><em>{doneCount}</em>/{total}</span>
          <span className="plan-ci-feedback-dots" aria-hidden="true">
            {tasks.map(t=>(
              <i key={t.id} className={(t.done ? 'is-on' : '') + (t.id === ctx.taskId ? ' is-current' : '')}/>
            ))}
          </span>
        </span>
        <span className="plan-ci-feedback-sub">{lead}，{tail}</span>
      </span>
      <span className="plan-ci-feedback-cta">
        回到计划
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      </span>
    </button>
  );
}

Object.assign(window, {
  planCheckInStore,
  usePlanCheckInVersion,
  getWeightPlanTasks,
  resolvePlanCheckInKind,
  PlanCheckInContext,
  usePlanCheckIn,
  PlanCheckInFeedback,
  PLAN_CHECKIN_EVENT,
});
