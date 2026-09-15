// scene3-correct.jsx — v2 场景3：语音纠正已有记录
//
// 初始态 = 场景1整个交互的播放完成态（见 scene1-ask.jsx 的 appendScene1CompletedState）
// 1. 按住说话松开 → 「说错了，今天流量特别大」按时间轴样式落轴，展示提取加载态 2s
// 2. 加载结束 → 弹出确认弹窗：以「变更前 / 变更后」两张记录卡对比流量「中等」→「大量」
// 3. 确认 → 09:31 经期记录卡的「流量：中等」刷新为「流量：大量」；取消 → 关闭弹窗，记录不变

const SCENE3_VOICE_TEXT = '说错了，今天流量特别大';
const SCENE3_TARGET_ENTRY_ID = 's1-period-done';
const SCENE3_FLOW_LABEL = '流量';
const SCENE3_FLOW_FROM = '中等';
const SCENE3_FLOW_TO = '大量';

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
  };
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

function applyScene3FlowCorrection(blocks){
  return blocks.map(block=>{
    if(block.type !== 'day') return block;
    const items = block.items || block.entries || [];
    if(!items.some(it=>it.id === SCENE3_TARGET_ENTRY_ID)) return block;
    return {
      ...block,
      entries:undefined,
      items:items.map(it=>(it.id !== SCENE3_TARGET_ENTRY_ID ? it : {
        ...it,
        periodDetails:correctScene3Details(it.periodDetails),
      })),
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
    { label:'月经来了', icon:'period' },
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

Object.assign(window, {
  createScene3CorrectionEntry,
  findScene3TargetEntry,
  applyScene3FlowCorrection,
  scrollScene3TargetIntoView,
  Scene3FlowConfirmDialog,
});
