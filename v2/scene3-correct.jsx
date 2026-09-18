// scene3-correct.jsx — v2 场景3：语音纠正已有记录
//
// 初始态 = 场景1整个交互的播放完成态（见 scene1-ask.jsx 的 appendScene1CompletedState）
// 1. 按住说话松开 → 「说错了，今天流量特别大」按时间轴样式落轴，展示提取加载态 2s
// 2. 加载结束 → 弹出确认弹窗：以「变更前 / 变更后」两张记录卡对比流量「中等」→「大量」
// 3. 确认 → 09:31 经期记录卡的「流量：中等」刷新为「流量：大量」，同时这句话的卡片补上「流量」标签；
//    取消 → 关闭弹窗，记录不变

const SCENE3_VOICE_TEXT = '刚才记错了，今天经血量比较大';
const SCENE3_TARGET_ENTRY_ID = 's1-period-done';
const SCENE3_FLOW_LABEL = '流量';
const SCENE3_FLOW_FROM = '中等';
const SCENE3_FLOW_TO = '大量';
// 确认后给纠正语句补上标签，表示从这句话里提取到了流量记录项
const SCENE3_CORRECTION_TAGS = [{ cat:SCENE3_FLOW_LABEL }];

// 与时间轴经期记录卡（PeriodRecordSummary）使用同一套图标
const SCENE3_ROW_ICON_SRC = {
  period:'assets/record-period-start.png',
  flow:'assets/record-flow.png',
  color:'assets/record-color.png',
  cramps:'assets/record-cramps.png',
};

function createScene3CorrectionEntry(){
  const now = Date.now();
  return {
    kind:'scene1-ask-record',
    id:'s3-correct-' + now,
    isNew:true,
    time:window.formatNowTime(),
    text:SCENE3_VOICE_TEXT,
    tags:[],
    extractDoneAt:now + window.SCENE1_EXTRACT_MS,
    // 提取结束后，确认改在这张卡的反馈模块里进行（不再弹窗）
    flowConfirm:'pending',
  };
}

// 场景3 初始态：先摆一条可以被改的经期记录（月经来了 / 流量：中等 / 痛经：轻微）
function appendScene3InitialState(blocks){
  if(!window.createScene1PeriodEntry) return blocks;
  const todayId = blocks.find(b=>b.type === 'day' && b.isToday)?.id;
  return window.appendTimelineEntry(
    blocks,
    window.createScene1PeriodEntry({ completed:true, time:'09:31' }),
    { dayId:todayId },
  );
}

function findScene3TargetEntry(blocks){
  for(const block of blocks || []){
    if(block.type !== 'day') continue;
    const hit = (block.items || block.entries || []).find(it=>it.id === SCENE3_TARGET_ENTRY_ID);
    if(hit) return hit;
  }
  return null;
}

function correctScene3Details(details){
  return (details || []).map(detail=>(
    detail.label === SCENE3_FLOW_LABEL ? { ...detail, value:SCENE3_FLOW_TO } : detail
  ));
}

// correctionEntryId：本次纠正语句的卡片 id，确认后给它补上「流量」标签
function applyScene3FlowCorrection(blocks, correctionEntryId){
  return blocks.map(block=>{
    if(block.type !== 'day') return block;
    const items = block.items || block.entries || [];
    const hasTarget = items.some(it=>it.id === SCENE3_TARGET_ENTRY_ID);
    const hasCorrection = !!correctionEntryId && items.some(it=>it.id === correctionEntryId);
    if(!hasTarget && !hasCorrection) return block;
    return {
      ...block,
      entries:undefined,
      items:items.map(it=>{
        if(it.id === SCENE3_TARGET_ENTRY_ID){
          return { ...it, periodDetails:correctScene3Details(it.periodDetails) };
        }
        if(correctionEntryId && it.id === correctionEntryId){
          return { ...it, tags:SCENE3_CORRECTION_TAGS };
        }
        return it;
      }),
    };
  });
}

function scrollScene3TargetIntoView(){
  requestAnimationFrame(()=>{
    const el = document.querySelector('[data-entry-id="' + SCENE3_TARGET_ENTRY_ID + '"]');
    if(el) el.scrollIntoView({ behavior:'smooth', block:'center' });
  });
}

// 弹窗里的记录卡预览：变更前置灰；变更后品牌红描边，仅变更的值高亮
function Scene3RecordPreview({entry, variant}){
  const isAfter = variant === 'after';
  const before = entry.periodDetails || [];
  const details = isAfter ? correctScene3Details(before) : before;
  const rows = [
    ...(entry.hidePeriodLabel ? [] : [{ label:'月经来了', icon:'period' }]),
    ...details.map((detail, i)=>({
      ...detail,
      changed:isAfter && detail.value !== before[i]?.value,
    })),
  ];
  return (
    <div className={'s3-preview-card is-' + variant}>
      {entry.time ? <div className="s3-preview-time">今天 {entry.time}</div> : null}
      {rows.map((row, i)=>(
        <div key={row.label + i} className={'s3-preview-row' + (row.changed ? ' is-changed' : '')}>
          <img
            className="s3-preview-icon"
            src={SCENE3_ROW_ICON_SRC[row.icon] || SCENE3_ROW_ICON_SRC.period}
            alt=""
            width="18"
            height="18"
            draggable={false}
          />
          <span className="s3-preview-label">{row.value ? row.label + '：' : row.label}</span>
          {row.value ? <span className="s3-preview-value">{row.value}</span> : null}
        </div>
      ))}
    </div>
  );
}

function Scene3FlowConfirmDialog({entry, onConfirm, onCancel}){
  const record = entry || {
    time:'',
    periodDetails:[{ label:SCENE3_FLOW_LABEL, value:SCENE3_FLOW_FROM, icon:'flow' }],
  };
  return (
    <div className="s3-dialog-mask">
      <div className="s3-dialog" role="alertdialog" aria-modal="true" aria-labelledby="s3-dialog-title" aria-describedby="s3-dialog-desc">
        <div className="s3-dialog-title" id="s3-dialog-title">修改流量记录</div>
        <p className="s3-dialog-desc" id="s3-dialog-desc">请确认是否执行以下修改：</p>

        <div className="s3-diff-panel">
          <div className="s3-diff-label">变更前</div>
          <Scene3RecordPreview entry={record} variant="before"/>
          <div className="s3-diff-label">变更后</div>
          <Scene3RecordPreview entry={record} variant="after"/>
        </div>

        <div className="s3-dialog-actions">
          <button type="button" className="s3-dialog-btn is-cancel" onClick={onCancel}>取消</button>
          <button type="button" className="s3-dialog-btn is-confirm" onClick={onConfirm}>确认</button>
        </div>
      </div>
    </div>
  );
}

// v2 场景3：把确认弹窗搬进记录卡的反馈模块。
// 结构对应点滴的信息结构：反馈（文案 + 前后对比）+ 操作区（取消 / 确认）。
// state：pending 待确认 / confirmed 已修改 / cancelled 已取消
// target：被修改的那条经期记录（09:31 的卡）；entryId：本次纠正语句卡片的 id
// onResolve：给对话二级页用 —— 传了就走回调，不走时间轴那套事件
function Scene3FlowConfirmInline({target, entryId, state = 'pending', onResolve}){
  const resolve = (action)=>{
    if(onResolve){ onResolve(action === 'confirm'); return; }
    window.dispatchEvent(new CustomEvent('scene3FlowResolve', { detail:{ entryId, action } }));
  };
  const record = target || {
    time:'',
    periodDetails:[{ label:SCENE3_FLOW_LABEL, value:SCENE3_FLOW_FROM, icon:'flow' }],
  };

  if(state === 'confirmed' || state === 'cancelled'){
    const done = state === 'confirmed';
    return (
      <div className={'s3-inline-result is-' + state} role="status">
        <span className="s3-inline-result-icon" aria-hidden="true">{done ? '✓' : '×'}</span>
        <span className="s3-inline-result-text">
          {done
            ? <>已把{SCENE3_FLOW_LABEL}改为 <b>{SCENE3_FLOW_TO}</b></>
            : <>已取消操作</>}
        </span>
      </div>
    );
  }

  return (
    <section className="s3-inline-confirm" aria-label="修改流量记录">
      <p className="s3-inline-desc">好的，请确认是否执行以下修改：</p>

      <div className="s3-inline-diff">
        <div className="s3-diff-label">变更前</div>
        <Scene3RecordPreview entry={record} variant="before"/>
        <div className="s3-diff-label">变更后</div>
        <Scene3RecordPreview entry={record} variant="after"/>
      </div>

      <div className="s3-inline-actions">
        <button
          type="button"
          className="s3-inline-btn is-cancel"
          onClick={()=>resolve('cancel')}
        >取消</button>
        <button
          type="button"
          className="s3-inline-btn is-confirm"
          onClick={()=>resolve('confirm')}
        >确认</button>
      </div>
    </section>
  );
}

Object.assign(window, {
  createScene3CorrectionEntry,
  appendScene3InitialState,
  findScene3TargetEntry,
  applyScene3FlowCorrection,
  scrollScene3TargetIntoView,
  Scene3FlowConfirmDialog,
  Scene3FlowConfirmInline,
});
