/* 爱爱：方案一 · 轻补全结构化字段。时间气泡直选，措施按需展开，光标自由续写。
 * Local interaction mock: suggestions are presets; notes are never invented. */
function LoveStructuredAutocomplete({onClose, onSave}) {
  const localDate = (date)=>{
    const pad = n=>String(n).padStart(2,'0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  const [datetime,setDatetime] = React.useState(()=>localDate(new Date()));
  const [nowMode,setNowMode] = React.useState(true);
  const [method,setMethod] = React.useState('');
  const [hasTime,setHasTime] = React.useState(true);
  const [hasMethod,setHasMethod] = React.useState(true);
  const [note,setNote] = React.useState('');
  const [active,setActive] = React.useState('time');
  const sent = React.useRef(false);
  const noteRef = React.useRef(null);
  const methods = ['避孕套','无措施','体外排精','短效避孕药','宫内节育器','其他'];
  const date = new Date(datetime);
  const valid = Number.isFinite(date.getTime());
  const invalidTime = hasTime && (!valid || (!nowMode && date>new Date()));
  const timeLabel = nowMode ? '现在' : valid ? `${date.getMonth()+1}月${date.getDate()}日 ${datetime.slice(11)}` : '选择时间';
  const save = ()=>{
    if(sent.current || invalidTime) return;
    sent.current = true;
    const value = !hasTime || nowMode ? localDate(new Date()) : datetime;
    const d = new Date(value);
    const time = value.slice(11);
    onSave({datetime:value,time,eventDatetime:hasTime?value:null,method:hasMethod&&method?method:null,note:note.trim(),text:['爱爱',hasTime?`${d.getMonth()+1}月${d.getDate()}日 ${time}`:null,hasMethod?method:null,note.trim()].filter(Boolean).join('，')});
  };
  const removeField = field=>{
    if(field==='time') setHasTime(false);
    else {setHasMethod(false);setMethod('');}
    setActive(null);noteRef.current?.focus();
  };
  const tokenKey = (e,field)=>{
    if(['Backspace','Delete','Enter'].includes(e.key)) {e.preventDefault();removeField(field);}
  };
  const deletePrevious = ()=>{
    if(hasMethod) removeField('method');
    else if(hasTime) removeField('time');
  };
  const backspace = ()=>{
    const input=noteRef.current;
    const start=input?.selectionStart ?? note.length;
    const end=input?.selectionEnd ?? start;
    if(start===0 && end===0) {deletePrevious();return;}
    const from=start===end?start-1:start;
    setNote(note.slice(0,from)+note.slice(end));
    requestAnimationFrame(()=>{input?.focus();input?.setSelectionRange(from,from);});
  };
  const activate = field=>setActive(active===field ? null : field);
  const pickTime = (offset)=>{
    const d = new Date(); d.setDate(d.getDate()+offset);
    if(offset) d.setHours(22,0,0,0);
    setDatetime(localDate(d));setHasTime(true);setNowMode(offset===0);setHasMethod(true);setActive('method');noteRef.current?.focus();
  };
  React.useEffect(()=>{
    const listener=e=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',listener);
    return ()=>document.removeEventListener('keydown',listener);
  },[onClose]);
  return <div className="love-layer" role="dialog" aria-modal="true" aria-label="爱爱：方案一 · 轻补全结构化字段">
    <button className="love-dismiss" aria-label="收起爱爱记录" onClick={onClose}/>
    <div className="love-bottom">
      {active==='time' && <div className="love-time-bubbles love-options">
        {['现在','昨晚 22:00','前晚 22:00'].map((label,i)=><button key={label} onClick={()=>pickTime(-i)}>{label}</button>)}
        <button onClick={()=>setActive('date')}>其他时间</button>
      </div>}
      {active==='date' && <div className="love-suggestions">
        <input aria-label="爱爱时间" type="datetime-local" value={datetime} max={localDate(new Date())} onChange={e=>{setDatetime(e.target.value);setHasTime(Boolean(e.target.value));setNowMode(false);}}/>
        <button className="love-next" disabled={!valid || date>new Date()} onClick={()=>{setHasMethod(true);setActive('method');noteRef.current?.focus();}}>确定</button>
      </div>}
      {active==='method' && <div className="love-time-bubbles love-options love-method-scroll">
        {methods.map(m=><button key={m} aria-pressed={method===m} onClick={()=>{setMethod(m);setHasMethod(true);setActive(null);noteRef.current?.focus();}}>{m}</button>)}
      </div>}
      <div className="love-composer">
        <div className="love-sentence"><button className="love-prefix" onClick={()=>{setActive('time');noteRef.current?.focus();}}>爱爱</button>
          {hasTime && <button className={'love-token '+(active==='time'?'active':'')} onClick={()=>activate('time')} onKeyDown={e=>tokenKey(e,'time')} aria-label="修改爱爱时间">{timeLabel}</button>}
          {hasMethod && <button className={'love-token '+(active==='method'?'active':'')+(!method?' empty':'')} onClick={()=>activate('method')} onKeyDown={e=>tokenKey(e,'method')} aria-label="修改措施">{method || '措施'}</button>}
          <input autoFocus ref={noteRef} className="love-free-input" aria-label="爱爱自由输入" value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>{
            if(e.nativeEvent.isComposing) return;
            if(e.key==='Backspace' && e.target.selectionStart===0 && e.target.selectionEnd===0){e.preventDefault();deletePrevious();}
            if(e.key==='Enter'){e.preventDefault();save();}
          }}/>

        </div>
        <button className="love-send" disabled={invalidTime} aria-label="保存爱爱记录" onClick={save}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/></svg></button>
      </div>
      {window.DockFakeKeyboard && <window.DockFakeKeyboard onInsert={s=>{setNote(v=>v+s);noteRef.current?.focus();}} onBackspace={backspace} onReturn={()=>{if(active==='method'||active==='time')removeField(active);else save();}}/>}

    </div>
  </div>;
}
// 爱爱：方案二 · 自然续写。所有补全均写入可编辑的普通文本。
function LoveNaturalAutocomplete({onClose,onSave}){
  const [text,setText]=React.useState('爱爱了');
  const [group,setGroup]=React.useState('time');
  const input=React.useRef(null);
  const sent=React.useRef(false);
  const methods=['用了避孕套','没做措施','体外排精','服用了短效避孕药','使用了宫内节育器'];
  const focus=()=>requestAnimationFrame(()=>{input.current?.focus();input.current?.setSelectionRange(input.current.value.length,input.current.value.length);});
  const pickTime=label=>{
    setText(v=>label+v.replace(/^(今天|昨天|前天|刚刚)/,''));setGroup('method');focus();
  };
  const pickMethod=label=>{
    setText(v=>{
      const previous=methods.find(m=>v.includes(m));
      return previous?v.replace(previous,label):v.replace(/[，,。\s]+$/,'')+(v.trim()?'，':'')+label;
    });setGroup(null);focus();
  };
  const edit=(value,back=false)=>{
    const el=input.current;
    const start=el?.selectionStart??text.length,end=el?.selectionEnd??start;
    const from=back&&start===end?Math.max(0,start-1):start;
    setText(text.slice(0,from)+value+text.slice(end));
    requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(from+value.length,from+value.length);});
  };
  const save=()=>{
    if(sent.current||!text.trim())return;
    sent.current=true;
    const d=new Date();
    const offset=/前天/.test(text)?-2:/昨天|昨晚/.test(text)?-1:0;
    d.setDate(d.getDate()+offset);
    const pad=n=>String(n).padStart(2,'0');
    const datetime=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    onSave({datetime,time:datetime.slice(11),text:text.trim(),scheme:'love-2',method:methods.find(m=>text.includes(m))||null});
  };
  React.useEffect(()=>{
    focus();const listener=e=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener);
  },[onClose]);
  return <div className="love-layer" role="dialog" aria-modal="true" aria-label="爱爱：方案二 · 自然续写">
    <button className="love-dismiss" aria-label="收起爱爱记录" onClick={onClose}/>
    <div className="love-bottom">
      {group && <div className="love-time-bubbles love-options love-method-scroll">
        {group==='time'?<>{['今天','昨天','前天','刚刚'].map(t=><button key={t} onClick={()=>pickTime(t)}>{t}</button>)}<button onClick={()=>setGroup('method')}>补充措施</button></>
          :group==='method'?<>{methods.map(m=><button key={m} onClick={()=>pickMethod(m)}>{m}</button>)}</>
          :null}
      </div>}
      <div className="love-composer">
        <textarea autoFocus ref={input} className="love-natural-input" aria-label="爱爱自然语言记录" rows="2" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();save();}}}/>
        <button className="love-send" disabled={!text.trim()} aria-label="保存爱爱记录" onClick={save}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/></svg></button>
      </div>
      {window.DockFakeKeyboard&&<window.DockFakeKeyboard onInsert={s=>edit(s)} onBackspace={()=>edit('',true)} onReturn={save}/>}
    </div>
  </div>;
}
window.LoveAutocomplete = function LoveScheme(props){return props.scheme==='love-2'?<LoveNaturalAutocomplete {...props}/>:<LoveStructuredAutocomplete {...props}/>;};
