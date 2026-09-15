// scene1-ask.jsx — v2 场景1：用户输入可提取结构化记录 + 健康咨询
//
// 1. 按住说话松开 → 「今天月经开始了，我的经期规律么？」落轴
// 2. 加载态 2s：「记录提取中...」「AI分析中...」轮播
// 3. 展示提取出的标签「月经来了」+ 对话入口「经期规律分析」
// 4. 点对话入口 → 二级页对话流：该句作为首条用户输入，AI 直接流式输出分析
// 5. 二级页按住说话松开 → 追加用户输入「今天流量中等，轻微痛经」→ 提取加载态 2s → AI 流式回复
//    加载态结束时，时间轴今天追加一张原生经期记录卡：月经来了 / 流量：中等 / 痛经：轻微
// 6. 返回点滴页再进入对话页：已输出的内容直接展示，不重复流式输出
//
// 场景2 复用同一套卡片与对话页：按住说话松开 → 「我的月经规律么？」落轴 → 加载态 2s → 只展示对话入口（无标签）

const SCENE1_QUESTION = '今天月经开始了，我的经期规律么？';
const SCENE1_CHAT_TITLE = '经期规律分析';
const SCENE1_EXTRACT_MS = 2000;
const SCENE1_LOADING_COPY = ['记录提取中...', 'AI分析中...'];
const SCENE1_LOADING_ROTATE_MS = 1000;

// 流式输出速度：每 36ms 吐 1–3 个字，接近真实大模型输出节奏
const SCENE1_STREAM_TICK_MS = 36;

const SCENE1_ANSWER = [
  { type:'p', text:'已帮你记下「月经来了」。结合你最近 6 个周期的记录，一起来看看规律性：' },
  { type:'h', text:'你的周期情况' },
  { type:'li', text:'平均周期 29 天，最近 6 次在 27–31 天之间' },
  { type:'li', text:'经期平均持续 5 天，前后比较一致' },
  { type:'li', text:'这次比预测提前 1 天，属于正常波动' },
  { type:'h', text:'结论：你的经期是规律的' },
  { type:'p', text:'一般来说，周期在 21–35 天之间、相邻两次相差不超过 7 天，都算规律。你最近的波动只有 4 天，整体状态不错。' },
  { type:'h', text:'这几天可以这样照顾自己' },
  { type:'li', text:'注意腹部保暖、少吃生冷，痛经时可以热敷小腹' },
  { type:'li', text:'顺手记下流量和痛经程度，下次分析会更准' },
  { type:'li', text:'如果周期连续短于 21 天或长于 35 天，或经期超过 7 天，建议及时就医' },
];

// 场景2：纯提问，没有可提取的记录；对话页首条分析去掉「已帮你记下」
const SCENE2_QUESTION = '我的月经规律么？';
const SCENE2_ANSWER = [
  { type:'p', text:'结合你最近 6 个周期的记录，一起来看看你的月经规律性：' },
  { type:'h', text:'你的周期情况' },
  { type:'li', text:'平均周期 29 天，最近 6 次在 27–31 天之间' },
  { type:'li', text:'经期平均持续 5 天，前后比较一致' },
  { type:'li', text:'最近一次周期比预测提前 1 天，属于正常波动' },
  { type:'h', text:'结论：你的经期是规律的' },
  { type:'p', text:'一般来说，周期在 21–35 天之间、相邻两次相差不超过 7 天，都算规律。你最近的波动只有 4 天，整体状态不错。' },
  { type:'h', text:'这几天可以这样照顾自己' },
  { type:'li', text:'注意腹部保暖、少吃生冷，痛经时可以热敷小腹' },
  { type:'li', text:'顺手记下流量和痛经程度，下次分析会更准' },
  { type:'li', text:'如果周期连续短于 21 天或长于 35 天，或经期超过 7 天，建议及时就医' },
];

// 二级页追问：按住说话松开后的固定语音内容；AI 先展示与时间轴一致的提取加载态，再流式回复
const SCENE1_FOLLOWUP_TEXT = '今天流量中等，轻微痛经';
const SCENE1_FOLLOWUP_ANSWER = [
  { type:'p', text:'已经帮你记录下今天的流量和痛经情况，可以在点滴时间轴查看记录内容。' },
];

// options.completed：直接生成播放完成态（无加载态、无入场动画，对话页展示完整历史），供场景3初始态使用
function createScene1AskEntry(options = {}){
  const now = Date.now();
  const completed = !!options.completed;
  return {
    kind:'scene1-ask-record',
    id:completed ? 's1-ask-done' : 's1-ask-' + now,
    isNew:!completed,
    time:options.time || window.formatNowTime(),
    text:SCENE1_QUESTION,
    tags:[{ cat:'月经来了' }],
    chatTitle:SCENE1_CHAT_TITLE,
    chatCompleted:completed,
    // 用时间戳而非本地计时，卡片重新挂载（如切 Tab 回来）不会重播加载态
    extractDoneAt:completed ? 0 : now + SCENE1_EXTRACT_MS,
  };
}

// 场景2：纯提问、无可提取的记录 —— 落轴 + 加载态后只展示对话入口（样式同场景1），不展示标签
function createScene2AskEntry(){
  const now = Date.now();
  return {
    kind:'scene1-ask-record',
    id:'s2-ask-' + now,
    isNew:true,
    time:window.formatNowTime(),
    text:SCENE2_QUESTION,
    tags:[],
    chatTitle:SCENE1_CHAT_TITLE,
    answerKey:'scene2',
    extractDoneAt:now + SCENE1_EXTRACT_MS,
  };
}

// 二级页追问提取出的结构化经期记录：沿用时间轴原生经期记录卡（sync-card → PeriodRecordSummary）
// 不带 periodSummaryLabel / analysisKind / cardLabel，避免触发经期分析、「经期感受」引导等联动
function createScene1PeriodEntry(options = {}){
  const completed = !!options.completed;
  return {
    kind:'sync-card',
    id:completed ? 's1-period-done' : 's1-period-' + Date.now(),
    isNew:!completed,
    time:options.time || window.formatNowTime(),
    tagLayout:'v3',
    tags:[{ label:'月经来了', cat:'period', val:'', icon:'period' }],
    periodDetails:[
      { label:'流量', value:'中等', icon:'flow' },
      { label:'痛经', value:'轻微', icon:'cramps' },
    ],
  };
}

// 场景3初始态：场景1整个交互播放完成后的时间轴 —— 今天追加提问卡（已提取）+ 原生经期记录卡
// 使用固定时间，保证每次进入场景3画面一致
const SCENE1_COMPLETED_TIMES = { ask:'09:30', period:'09:31' };
function appendScene1CompletedState(blocks){
  const todayId = blocks.find(b=>b.type === 'day' && b.isToday)?.id;
  let next = window.appendTimelineEntry(
    blocks,
    createScene1AskEntry({ completed:true, time:SCENE1_COMPLETED_TIMES.ask }),
    { dayId:todayId },
  );
  next = window.appendTimelineEntry(
    next,
    createScene1PeriodEntry({ completed:true, time:SCENE1_COMPLETED_TIMES.period }),
    { dayId:todayId },
  );
  return next;
}

function Scene1LoadingDots(){
  return (
    <span className="s1-dots" aria-hidden="true"><i/><i/><i/></span>
  );
}

// 「记录提取中...」「AI分析中...」轮播加载态：时间轴卡片与对话页共用，何时结束由外部决定
function Scene1ExtractLoading(){
  const [copyIdx, setCopyIdx] = React.useState(0);

  React.useEffect(()=>{
    const rotate = setInterval(()=>{
      setCopyIdx(i=>(i + 1) % SCENE1_LOADING_COPY.length);
    }, SCENE1_LOADING_ROTATE_MS);
    return ()=>clearInterval(rotate);
  }, []);

  return (
    <div className="s1-ask-loading" role="status" aria-live="polite">
      <Scene1LoadingDots/>
      <span key={copyIdx} className="s1-ask-loading-text">{SCENE1_LOADING_COPY[copyIdx]}</span>
    </div>
  );
}

function Scene1ChatIcon({size = 22}){
  const gradId = 's1-chat-grad-' + React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6aa0"/>
          <stop offset="52%" stopColor="#ff4d88"/>
          <stop offset="100%" stopColor="#b85cff"/>
        </linearGradient>
      </defs>
      <path
        d="M12 3.5c4.97 0 9 3.36 9 7.5s-4.03 7.5-9 7.5c-.9 0-1.77-.11-2.6-.32L5.2 20.2a.6.6 0 01-.86-.66l.72-3.3C3.8 14.93 3 13.03 3 11c0-4.14 4.03-7.5 9-7.5z"
        fill={'url(#' + gradId + ')'}
      />
      <circle cx="8.2" cy="11" r="1.15" fill="#fff"/>
      <circle cx="12" cy="11" r="1.15" fill="#fff"/>
      <circle cx="15.8" cy="11" r="1.15" fill="#fff"/>
    </svg>
  );
}

function Scene1AskRecordCard({entry, isNew}){
  const [extracting, setExtracting] = React.useState(()=>Date.now() < (entry.extractDoneAt || 0));

  React.useEffect(()=>{
    if(!extracting) return;
    const done = setTimeout(()=>setExtracting(false), Math.max(0, entry.extractDoneAt - Date.now()));
    return ()=>clearTimeout(done);
  }, [extracting, entry.extractDoneAt]);

  const openChat = ()=>{
    window.dispatchEvent(new CustomEvent('openScene1Chat', {
      detail:{ question:entry.text, title:entry.chatTitle, entryId:entry.id, completed:!!entry.chatCompleted, answerKey:entry.answerKey },
    }));
  };

  const V3v2Header = window.V3v2Header;
  const TLTag = window.TLTag;
  // 完成态（场景3初始态）标签与入口直接展示，只有新落轴的卡片才做淡入
  const revealCls = isNew ? ' s1-reveal' : '';
  const hasTags = (entry.tags || []).length > 0;
  // 无标签、无对话入口（如场景3的纠正语句）：加载结束后只保留原话
  const textOnly = !extracting && !hasTags && !entry.chatTitle;

  return (
    <div className={'s1-ask-card' + (isNew ? ' fade-in' : '') + (textOnly ? ' is-text-only' : '')} data-entry-id={entry.id}>
      {V3v2Header ? <V3v2Header time={entry.time}/> : null}
      <div className="s1-ask-body">{entry.text}</div>

      {extracting ? (
        <Scene1ExtractLoading/>
      ) : (
        <>
          {hasTags ? (
            <div className={'s1-ask-tags' + revealCls}>
              {TLTag ? entry.tags.map((tag, i)=><TLTag key={i} tag={tag}/>) : null}
            </div>
          ) : null}
          {entry.chatTitle ? (
            <>
              <div className="s1-ask-divider" role="separator"/>
              <button type="button" className={'s1-ask-chat-entry' + revealCls} onClick={openChat}>
                <span className="s1-ask-chat-icon"><Scene1ChatIcon/></span>
                <span className="s1-ask-chat-title">{entry.chatTitle}</span>
                <svg className="s1-ask-chat-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 6l6 6-6 6"/>
                </svg>
              </button>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function countScene1Chars(blocks){
  return blocks.reduce((sum, block)=>sum + block.text.length, 0);
}

function renderScene1AnswerBlocks(blocks, shownChars, streaming){
  let remaining = shownChars;
  const out = [];
  for(let i = 0; i < blocks.length; i++){
    if(remaining <= 0) break;
    const block = blocks[i];
    const visible = block.text.slice(0, remaining);
    remaining -= block.text.length;
    const isTail = streaming && remaining <= 0;
    const caret = isTail ? <span className="ai-caret"/> : null;
    if(block.type === 'h'){
      out.push(<div key={i} className="s1-chat-h">{visible}{caret}</div>);
    } else if(block.type === 'li'){
      out.push(<div key={i} className="s1-chat-li">{visible}{caret}</div>);
    } else {
      out.push(<p key={i} className="s1-chat-p">{visible}{caret}</p>);
    }
  }
  return out;
}

// 单条 AI 回复：loadingUntil 之前展示提取加载态，随后流式输出，结束后展示「内容由 AI 生成」
// instant：直接展示全文（完成态）
// initialShown：已输出过的字数 —— 返回点滴页再进入时从这里继续，已输出的内容不重复流式输出
function Scene1AiMessage({blocks, loadingUntil = 0, instant = false, initialShown = 0, onShown, onProgress, onDone}){
  const total = React.useMemo(()=>countScene1Chars(blocks), [blocks]);
  const [loading, setLoading] = React.useState(()=>!instant && Date.now() < loadingUntil);
  const [shown, setShown] = React.useState(()=>(instant ? total : Math.min(initialShown, total)));
  const done = !loading && shown >= total;
  const onProgressRef = React.useRef(onProgress);
  const onDoneRef = React.useRef(onDone);
  const onShownRef = React.useRef(onShown);
  onProgressRef.current = onProgress;
  onDoneRef.current = onDone;
  onShownRef.current = onShown;

  React.useEffect(()=>{
    if(!loading) return;
    const timer = setTimeout(()=>setLoading(false), Math.max(0, loadingUntil - Date.now()));
    return ()=>clearTimeout(timer);
  }, [loading, loadingUntil]);

  React.useEffect(()=>{
    if(loading) return;
    if(done){
      onDoneRef.current?.();
      return;
    }
    const timer = setTimeout(()=>{
      setShown(n=>Math.min(total, n + 1 + Math.floor(Math.random() * 3)));
    }, SCENE1_STREAM_TICK_MS);
    return ()=>clearTimeout(timer);
  }, [loading, shown, total, done]);

  React.useEffect(()=>{
    onShownRef.current?.(shown);
  }, [shown]);

  React.useLayoutEffect(()=>{
    onProgressRef.current?.();
  }, [loading, shown]);

  return (
    <div className="s1-chat-msg is-ai">
      <div className="s1-chat-ai">
        {loading ? (
          <Scene1ExtractLoading/>
        ) : (
          <div className="s1-chat-answer" aria-live="polite" aria-busy={!done}>
            {renderScene1AnswerBlocks(blocks, shown, !done)}
          </div>
        )}
        {done ? (
          <div className="s1-chat-disclaimer s1-reveal">内容由 AI 生成</div>
        ) : null}
      </div>
    </div>
  );
}

// 二级页底部输入栏：沿用点滴页 Dock 的胶囊输入框（dock-input-pill），不含快捷记录按钮
// busy 时（AI 正在回复）按住说话不响应，与点滴页演示中的 isDemoRunning 一致
function Scene1ChatInput({busy = false, onVoiceDone}){
  const Icon = window.Icon;
  const DockVoiceCircleIco = window.DockVoiceCircleIco;
  const DockKbdCircleIco = window.DockKbdCircleIco;
  const DockWavePlaceholder = window.DockWavePlaceholder;
  const [inputMode, setInputMode] = React.useState('voice');
  const [draft, setDraft] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  // 用 ref 记录录音状态：按下后立刻松开时 state 还没更新，也能正确触发发送
  const recordingRef = React.useRef(false);

  const startRec = ()=>{
    if(busy) return;
    recordingRef.current = true;
    setRecording(true);
  };
  const stopRec = ()=>{
    if(!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    onVoiceDone?.();
  };
  const cancelRec = ()=>{
    recordingRef.current = false;
    setRecording(false);
  };

  return (
    <div className="s1-chat-dock">
      <div className="dock-bar is-path-dock">
        <div className="dock-input-row dock-input-pill">
          <button
            type="button"
            className="dock-mode-btn"
            onClick={()=>setInputMode(m=>m === 'text' ? 'voice' : 'text')}
            aria-label={inputMode === 'text' ? '切换语音' : '切换键盘'}
          >
            {inputMode === 'text'
              ? (DockVoiceCircleIco ? <DockVoiceCircleIco size={26}/> : null)
              : (DockKbdCircleIco ? <DockKbdCircleIco size={26}/> : null)}
          </button>

          {inputMode === 'text' ? (
            <div className={'dock-text-field' + (focused ? ' is-focused' : '')}>
              {DockWavePlaceholder ? <DockWavePlaceholder show={!draft.trim()} focused={focused}/> : null}
              <textarea
                rows="1"
                placeholder=""
                aria-label="输入内容"
                value={draft}
                onChange={(e)=>{
                  setDraft(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 72) + 'px';
                }}
                onFocus={()=>setFocused(true)}
                onBlur={()=>setFocused(false)}
              />
            </div>
          ) : (
            <div className={'dock-voice-wrap' + (recording ? ' is-recording' : '')}>
              <div className="dock-voice-stage" aria-hidden="true">
                <span className="dock-voice-shimmer"/>
              </div>
              <button
                type="button"
                className={'dock-voice-btn' + (recording ? ' recording' : '')}
                onPointerDown={(e)=>{ e.preventDefault(); startRec(); }}
                onPointerUp={stopRec}
                onPointerLeave={recording ? stopRec : undefined}
                onPointerCancel={cancelRec}
              >
                {recording ? (
                  <>
                    <span className="dock-voice-waves" aria-hidden="true">
                      {[4,8,12,8,6,10,7].map((h, j)=><span key={j} style={{height:h + 'px'}}/>)}
                    </span>
                    <span>松开 结束</span>
                  </>
                ) : (
                  <span className="dock-voice-label">按住 说话</span>
                )}
              </button>
            </div>
          )}

          {inputMode === 'text' && draft.trim() ? (
            <button type="button" className="dock-send-btn" aria-label="发送">
              {Icon ? <Icon name="send" size={16} stroke={2}/> : null}
            </button>
          ) : null}

          <button type="button" className="dock-camera-btn" aria-label="智能拍照记录">
            {Icon ? <Icon name="camera" size={22} stroke={1.7}/> : null}
          </button>
        </div>
      </div>
    </div>
  );
}

// 对话历史缓存：按时间轴卡片 id 保存消息列表与每条 AI 回复已输出的字数
// 返回点滴页再进入时直接展示已输出的内容，没输出完的从断点继续；切换场景时由 app.jsx 调用 resetScene1ChatStore 清空
const scene1ChatStore = new Map();

function resetScene1ChatStore(){
  scene1ChatStore.clear();
}

function getScene1ChatSession(key, completed, question, answerKey){
  if(!scene1ChatStore.has(key)){
    // completed：场景3初始态，直接是场景1播放完成后的完整对话，不再加载、不再流式输出
    const messages = completed ? [
      { id:'u-0', role:'user', text:question },
      { id:'a-0', role:'ai', blocks:SCENE1_ANSWER, instant:true },
      { id:'u-1', role:'user', text:SCENE1_FOLLOWUP_TEXT },
      { id:'a-1', role:'ai', blocks:SCENE1_FOLLOWUP_ANSWER, instant:true },
    ] : [
      { id:'u-0', role:'user', text:question },
      { id:'a-0', role:'ai', blocks:answerKey === 'scene2' ? SCENE2_ANSWER : SCENE1_ANSWER },
    ];
    scene1ChatStore.set(key, { messages, shown:{} });
  }
  return scene1ChatStore.get(key);
}

function isScene1MessageDone(msg, session){
  if(msg.role !== 'ai' || msg.instant) return true;
  return Date.now() >= (msg.loadingUntil || 0)
    && (session.shown[msg.id] || 0) >= countScene1Chars(msg.blocks);
}

function Scene1ChatPage({question, title, completed = false, entryId, answerKey, onBack, onRecord}){
  const [session] = React.useState(()=>getScene1ChatSession(entryId || question, completed, question, answerKey));
  const [messages, setMessages] = React.useState(session.messages);
  const [replying, setReplying] = React.useState(()=>session.messages.some(msg=>!isScene1MessageDone(msg, session)));
  const scrollRef = React.useRef(null);
  const onRecordRef = React.useRef(onRecord);
  onRecordRef.current = onRecord;

  const scrollToBottom = React.useCallback(()=>{
    const el = scrollRef.current;
    if(el) el.scrollTop = el.scrollHeight;
  }, []);
  const handleReplyDone = React.useCallback(()=>setReplying(false), []);

  const handleVoiceDone = ()=>{
    if(replying) return;
    const now = Date.now();
    const next = [
      ...session.messages,
      { id:'u-' + now, role:'user', text:SCENE1_FOLLOWUP_TEXT },
      { id:'a-' + now, role:'ai', blocks:SCENE1_FOLLOWUP_ANSWER, loadingUntil:now + SCENE1_EXTRACT_MS },
    ];
    session.messages = next;
    setMessages(next);
    setReplying(true);
    // 经期记录的落轴时机由 App 层计时（与加载态同步），返回点滴页也不会取消
    onRecordRef.current?.();
  };

  React.useLayoutEffect(scrollToBottom, [messages.length, scrollToBottom]);

  return (
    <div className="s1-chat-page" role="dialog" aria-label={title}>
      <header className="s1-chat-nav">
        <button type="button" className="s1-chat-back" onClick={onBack} aria-label="返回">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <div className="s1-chat-title">{title}</div>
        <div className="s1-chat-nav-spacer"/>
      </header>

      <div className="s1-chat-scroll" ref={scrollRef}>
        {messages.map((msg)=>(
          msg.role === 'user' ? (
            <div key={msg.id} className="s1-chat-msg is-user s1-reveal">
              <div className="s1-chat-bubble">{msg.text}</div>
            </div>
          ) : (
            <Scene1AiMessage
              key={msg.id}
              blocks={msg.blocks}
              loadingUntil={msg.loadingUntil}
              instant={msg.instant}
              initialShown={session.shown[msg.id] || 0}
              onShown={(n)=>{ session.shown[msg.id] = n; }}
              onProgress={scrollToBottom}
              onDone={handleReplyDone}
            />
          )
        ))}
      </div>

      <Scene1ChatInput busy={replying} onVoiceDone={handleVoiceDone}/>
    </div>
  );
}

Object.assign(window, {
  SCENE1_EXTRACT_MS,
  createScene1AskEntry,
  createScene2AskEntry,
  createScene1PeriodEntry,
  appendScene1CompletedState,
  resetScene1ChatStore,
  Scene1AskRecordCard,
  Scene1ChatPage,
});
