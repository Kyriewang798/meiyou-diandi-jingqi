// now-anchor.jsx — 方案一：时间轴「今天」下方的「现在」记录点

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

function NowAnchorVoiceModeIcon(){
  return (
    <svg viewBox="0 0 48 48" fill="none" width="26" height="26" aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.8"/>
      <path d="M21.5 19.5 A6 6 0 0 1 21.5 28.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M24 15.5 A10 10 0 0 1 24 32.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M26.5 12 A14 14 0 0 1 26.5 36" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
    </svg>
  );
}

function NowAnchorKbdModeIcon(){
  const row1 = [12,16.5,21,25.5,30,34.5];
  const row2 = [14.5,19,23.5,28,32.5];
  return (
    <svg viewBox="0 0 48 48" fill="none" width="26" height="26" aria-hidden="true">
      <circle cx="24" cy="24" r="21.5" stroke="currentColor" strokeWidth="2.6"/>
      {row1.map(x=><circle key={x} cx={x} cy={18} r={2.3} fill="currentColor"/>)}
      {row2.map(x=><circle key={x} cx={x} cy={24.5} r={2.3} fill="currentColor"/>)}
      <rect x="15" y="29.5" width="18" height="3.5" rx="1.75" fill="currentColor"/>
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

function NowAnchorComposer({ quickItems = [], onQuickSelect, onSubmit, onPhoto, onExpandChange, keyboardApiRef = null }){
  const now = useNowAnchorClock();
  const [expanded, setExpanded] = React.useState(false);
  const [text, setText] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const [chipPage, setChipPage] = React.useState(0);
  const textRef = React.useRef(null);
  const rootRef = React.useRef(null);

  const syncChipPage = (e)=>{
    const el = e.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    setChipPage(max > 0 && el.scrollLeft > max / 2 ? 1 : 0);
  };

  const timeLabel = nowAnchorPad(now.getHours()) + ':' + nowAnchorPad(now.getMinutes());

  const expandWith = (seed)=>{
    if(typeof seed === 'string') setText(seed);
    setExpanded(true);
  };

  const collapse = React.useCallback(()=>{
    setExpanded(false);
    setListening(false);
    setText(prev=>prev.replace(/\s+$/, ''));
  }, []);

  const [inputMode, setInputMode] = React.useState('text');
  const [barListening, setBarListening] = React.useState(false);
  const holdTimerRef = React.useRef(null);
  const holdActiveRef = React.useRef(false);
  const holdPendingRef = React.useRef(false);

  const appendVoice = ()=>{
    setText(prev=>{
      const base = prev.replace(/\s+$/, '');
      return base ? base + '，' + NOW_ANCHOR_VOICE_SAMPLE : NOW_ANCHOR_VOICE_SAMPLE;
    });
  };

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

  const beginVoiceHold = (e)=>{
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
    setText(prev=>{
      const base = prev.replace(/\s+$/, '');
      return base ? base + '，' + NOW_ANCHOR_VOICE_SAMPLE : NOW_ANCHOR_VOICE_SAMPLE;
    });
  };

  return (
    <div ref={rootRef} className={'now-anchor tl-rail-break'+(expanded ? ' is-expanded' : '')}>
      <div className="now-anchor-head">
        <span className="now-anchor-head-label">
          <span className="now-anchor-head-now">现在</span> {timeLabel}
        </span>
      </div>

      {expanded ? (
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
              <span className="now-anchor-listening-waves" aria-hidden="true">
                {[4,8,12,8,6,10,7].map((h,j)=><span key={j} style={{height:h+'px'}}/>)}
              </span>
              <span>正在听，再点话筒结束</span>
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
              className={'now-anchor-submit'+(text.trim() ? ' is-ready' : '')}
              onClick={submit}
              disabled={!text.trim()}
              aria-label="保存记录"
            >
              <NowAnchorCheckIcon/>
            </button>
          </div>
        </div>
      ) : (
        <div className="now-anchor-bar">
          <button
            type="button"
            className="now-anchor-mode"
            onClick={()=>{
              setBarListening(false);
              setInputMode(m=>m === 'text' ? 'voice' : 'text');
            }}
            aria-label={inputMode === 'text' ? '切换语音' : '切换键盘'}
          >
            {inputMode === 'text' ? <NowAnchorVoiceModeIcon/> : <NowAnchorKbdModeIcon/>}
          </button>
          {inputMode === 'text' ? (
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
                  <span>正在听...</span>
                </span>
              ) : text.trim() ? (
                <span className="now-anchor-field-text">{text}</span>
              ) : (
                <span className="now-anchor-field-ph">记录此刻...</span>
              )}
            </div>
          ) : (
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
                  <span>松开 结束</span>
                </>
              ) : '按住说话'}
            </button>
          )}
          {inputMode === 'text' && text.trim() ? (
            <button type="button" className="now-anchor-bar-send" onClick={submit} aria-label="保存记录">
              <NowAnchorCheckIcon/>
            </button>
          ) : (
            <button type="button" className="now-anchor-bar-photo" onClick={onPhoto} aria-label="添加图片">
              <NowAnchorImageIcon/>
            </button>
          )}
        </div>
      )}

      {expanded ? (
        <div className="now-anchor-hint">心情 · 饮食 · 身体感受 · 随手想到的事…都可以记</div>
      ) : quickItems.length ? (
        <>
          <div className="now-anchor-chips" onScroll={syncChipPage}>
            {quickItems.map(item=>(
              <button
                key={item.id}
                type="button"
                className="now-anchor-chip"
                onClick={(e)=>handleChip(item, e.currentTarget)}
              >
                <span className="now-anchor-chip-icon" aria-hidden="true">{item.iconNode || item.icon || null}</span>
                <span className="now-anchor-chip-label">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="now-anchor-dots" aria-hidden="true">
            {[0, 1].map(i=>(
              <span key={i} className={'now-anchor-dot'+(i === chipPage ? ' is-active' : '')}/>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

Object.assign(window, { NowAnchorComposer });
