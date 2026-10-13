// now-anchor.jsx — 时间轴「今天」下方的「现在」记录卡片
// variant='inline'：单行（时间胶囊 + 输入 + 话筒/相册）
// variant='stack'：分层（「现在」标题 + 话筒 | 输入框 | 相册 + 分割线 + 快捷标签）

const NOW_ANCHOR_VOICE_SAMPLE = '小腹有点胀，量中等，有点累';

function nowAnchorPad(n){
  return String(n).padStart(2, '0');
}

function useNowAnchorClock(){
  const [now, setNow] = React.useState(()=>new Date());
  React.useEffect(()=>{
    const timer = setInterval(()=>setNow(new Date()), 15000);
    return ()=>clearInterval(timer);
  }, []);
  return now;
}

function NowAnchorMicIcon(){
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3"/>
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>
    </svg>
  );
}

function NowAnchorKeyboardIcon(){
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2.5"/>
      <path d="M7 10h.01M10.5 10h.01M14 10h.01M17 10h.01M7 13.5h.01M17 13.5h.01M10 14.5h4"/>
    </svg>
  );
}

function NowAnchorWaves(){
  return (
    <span className="now-anchor-listening-waves" aria-hidden="true">
      {[4,8,12,8,6,10,7].map((h,j)=><span key={j} style={{height:h+'px'}}/>)}
    </span>
  );
}

function NowAnchorImageIcon(){
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7"/>
      <circle cx="9" cy="10" r="1.8" fill="currentColor"/>
      <path d="M4 17l5-4.5 3.5 3 3-2.5L20 17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
}

function NowAnchorCheckIcon(){
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NOW_ANCHOR_CHIP_TONE = {
  'period-start':'period',
  'period-end':'period',
  'period-feel':'period',
  weight:'lavender',
  symptom:'blue',
  mood:'yellow',
  diet:'orange',
  beverage:'blue',
};

function NowAnchorComposer({ variant = 'inline', quickItems = [], onQuickSelect, onSubmit, onPhoto, onExpandChange, keyboardApiRef = null }){
  const now = useNowAnchorClock();
  const [expanded, setExpanded] = React.useState(false);
  const [text, setText] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const [barListening, setBarListening] = React.useState(false);
  const [inputMode, setInputMode] = React.useState('text');
  const textRef = React.useRef(null);
  const holdTimerRef = React.useRef(null);
  const holdActiveRef = React.useRef(false);
  const holdPendingRef = React.useRef(false);

  const timeLabel = nowAnchorPad(now.getHours()) + ':' + nowAnchorPad(now.getMinutes());
  const hasText = !!text.trim();

  const appendVoice = ()=>{
    setText(prev=>{
      const base = prev.replace(/\s+$/, '');
      return base ? base + '，' + NOW_ANCHOR_VOICE_SAMPLE : NOW_ANCHOR_VOICE_SAMPLE;
    });
  };

  const expandWith = (seed)=>{
    if(barListening){
      setBarListening(false);
      appendVoice();
    }
    if(typeof seed === 'string') setText(seed);
    setExpanded(true);
  };

  const collapse = React.useCallback(()=>{
    setExpanded(false);
    setListening(false);
    setText(prev=>prev.replace(/\s+$/, ''));
  }, []);

  const clearHoldTimer = ()=>{
    if(holdTimerRef.current){
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const beginFieldHold = (e)=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    holdPendingRef.current = true;
    holdActiveRef.current = false;
    clearHoldTimer();
    holdTimerRef.current = setTimeout(()=>{
      holdTimerRef.current = null;
      holdPendingRef.current = false;
      holdActiveRef.current = true;
      setBarListening(true);
    }, 350);
  };

  const endFieldHold = (asLeave)=>{
    const wasPending = holdPendingRef.current;
    holdPendingRef.current = false;
    clearHoldTimer();
    if(holdActiveRef.current){
      holdActiveRef.current = false;
      setBarListening(false);
      appendVoice();
      return;
    }
    if(asLeave) return;
    if(wasPending) expandWith();
  };

  const toggleInputMode = ()=>{
    clearHoldTimer();
    holdActiveRef.current = false;
    holdPendingRef.current = false;
    setBarListening(false);
    setInputMode(m=>m === 'text' ? 'voice' : 'text');
  };

  const beginVoiceHold = (e)=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    setBarListening(true);
  };

  const endVoiceHold = ()=>{
    if(!barListening) return;
    setBarListening(false);
    onSubmit?.(NOW_ANCHOR_VOICE_SAMPLE);
  };

  React.useEffect(()=>()=>clearHoldTimer(), []);

  const submit = React.useCallback(()=>{
    const value = text.trim();
    if(!value) return;
    onSubmit?.(value);
    setText('');
    setExpanded(false);
    setListening(false);
  }, [text, onSubmit]);

  React.useEffect(()=>{
    onExpandChange?.(expanded);
    if(!expanded) return undefined;
    const t = setTimeout(()=>{
      textRef.current?.focus({ preventScroll:true });
    }, 60);
    return ()=>clearTimeout(t);
  }, [expanded]);

  React.useEffect(()=>{
    if(!keyboardApiRef) return undefined;
    keyboardApiRef.current = {
      insert:(ch)=>setText(prev=>prev + ch),
      backspace:()=>setText(prev=>prev.slice(0, -1)),
      submit,
      collapse,
    };
    return ()=>{ keyboardApiRef.current = null; };
  }, [keyboardApiRef, submit, collapse]);

  const handleChip = (item, el)=>{
    if(item.action === 'period-start'){
      expandWith('今天月经来了 ');
      return;
    }
    if(item.action === 'period-end'){
      expandWith('今天月经走了 ');
      return;
    }
    onQuickSelect?.(item, el);
  };

  const endListening = ()=>{
    if(!listening) return;
    setListening(false);
    appendVoice();
  };

  const timePill = (
    <span className="now-anchor-time-pill">
      <span className="now-anchor-time-dot" aria-hidden="true"/>
      {timeLabel}
    </span>
  );

  const field = (
    <div
      className={'now-anchor-field'+(barListening ? ' is-listening' : '')}
      role="button"
      tabIndex={0}
      onPointerDown={beginFieldHold}
      onPointerUp={()=>endFieldHold(false)}
      onPointerLeave={()=>endFieldHold(true)}
      onPointerCancel={()=>endFieldHold(true)}
    >
      {barListening ? (
        <span className="now-anchor-field-listening" aria-live="polite">
          <NowAnchorWaves/>
          <span>语音记录中</span>
        </span>
      ) : hasText ? (
        <span className="now-anchor-field-text">{text}</span>
      ) : (
        <span className="now-anchor-field-ph">记录此刻...</span>
      )}
    </div>
  );

  const holdBtn = (
    <button
      type="button"
      className={'now-anchor-hold'+(barListening ? ' is-listening' : '')}
      onPointerDown={beginVoiceHold}
      onPointerUp={endVoiceHold}
      onPointerLeave={endVoiceHold}
      onPointerCancel={endVoiceHold}
    >
      {barListening ? (
        <>
          <NowAnchorWaves/>
          <span>松开记下</span>
        </>
      ) : '按住说话'}
    </button>
  );

  const inputArea = inputMode === 'voice' ? holdBtn : field;

  const micBtn = (
    <button
      type="button"
      className="now-anchor-bar-mic"
      onClick={toggleInputMode}
      aria-label={inputMode === 'text' ? '切换语音' : '切换键盘'}
    >
      {inputMode === 'text' ? <NowAnchorMicIcon/> : <NowAnchorKeyboardIcon/>}
    </button>
  );

  const photoOrSend = inputMode === 'text' && hasText && !barListening ? (
    <button type="button" className="now-anchor-bar-send" onClick={submit} aria-label="保存记录">
      <NowAnchorCheckIcon/>
    </button>
  ) : (
    <button type="button" className="now-anchor-bar-photo" onClick={onPhoto} aria-label="添加图片">
      <NowAnchorImageIcon/>
    </button>
  );

  const editor = (
    <div className="now-anchor-editor">
      <textarea
        ref={textRef}
        className="now-anchor-textarea"
        placeholder="记录此刻..."
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onKeyDown={(e)=>{
          if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            submit();
          }
        }}
      />
      {listening ? (
        <div className="now-anchor-listening" aria-live="polite">
          <NowAnchorWaves/>
          <span>语音记录中</span>
        </div>
      ) : null}
      <div className="now-anchor-tools">
        <button
          type="button"
          className={'now-anchor-mic'+(listening ? ' is-listening' : '')}
          onMouseDown={(e)=>e.preventDefault()}
          onClick={()=>{
            if(listening) endListening();
            else setListening(true);
          }}
          aria-label={listening ? '结束录音' : '语音输入'}
          aria-pressed={listening}
        >
          <NowAnchorMicIcon/>
        </button>
        <button type="button" className="now-anchor-tool" onMouseDown={(e)=>e.preventDefault()} onClick={onPhoto} aria-label="添加图片">
          <NowAnchorImageIcon/>
        </button>
        <button
          type="button"
          className={'now-anchor-submit'+(hasText ? ' is-ready' : '')}
          onClick={submit}
          disabled={!hasText}
          aria-label="保存记录"
        >
          <NowAnchorCheckIcon/>
        </button>
      </div>
    </div>
  );

  return (
    <div className={'now-anchor tl-rail-break is-'+variant+(expanded ? ' is-expanded' : '')}>
      <div className="now-anchor-card">
        {variant === 'stack' ? (
          <div className="now-anchor-head">
            <span className="now-anchor-time-dot" aria-hidden="true"/>
            <span className="now-anchor-head-label">现在 {timeLabel}</span>
          </div>
        ) : (
          <div className="now-anchor-head">{timePill}</div>
        )}

        {expanded ? editor : variant === 'stack' ? (
          <div className="now-anchor-bar">
            {micBtn}
            {inputArea}
            {photoOrSend}
          </div>
        ) : (
          <div className="now-anchor-bar">
            {inputArea}
            {micBtn}
            {photoOrSend}
          </div>
        )}

        {expanded ? (
          <div className="now-anchor-hint">心情 · 饮食 · 身体感受 · 随手想到的事…都可以记</div>
        ) : quickItems.length ? (
          <div className="now-anchor-chips">
            {quickItems.map(item=>(
              <button
                key={item.id}
                type="button"
                className={'now-anchor-chip is-'+(NOW_ANCHOR_CHIP_TONE[item.action || item.id] || 'gray')}
                onClick={(e)=>handleChip(item, e.currentTarget)}
              >
                <span className="now-anchor-chip-icon" aria-hidden="true">{item.iconNode || item.icon || null}</span>
                <span className="now-anchor-chip-label">{item.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

Object.assign(window, { NowAnchorComposer });
