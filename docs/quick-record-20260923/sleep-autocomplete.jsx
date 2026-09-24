/* 睡眠：感受与情境。背景只来自用户输入，不推断因果或量化数据。 */
function SleepExperienceComposer({onClose,onSave}){
  const [text,setText]=React.useState('');
  const [stage,setStage]=React.useState('feeling');
  const [when,setWhen]=React.useState('');
  const input=React.useRef(null),sent=React.useRef(false);
  const steps={
    feeling:{prompt:'睡得怎么样？',options:['睡好了','没睡好','熬夜了','失眠了','作息不规律','夜里老醒'],next:'detail'},
    detail:{prompt:'感受怎么样？',options:['还是困','身体乏力','神清气爽','提不起精神'],next:'context'},
    context:{prompt:'还有什么相关的情况？',options:['压力大','加班','倒时差','上夜班','带娃','宠物打扰','睡前喝了咖啡','睡前喝了茶','睡前喝了酒','睡前玩手机','出差','环境太吵','换了睡觉的地方','身体不舒服','经期不适','有心事'],next:'context'}
  };
  const focus=()=>requestAnimationFrame(()=>{const el=input.current;el?.focus();el?.setSelectionRange(el.value.length,el.value.length);});
  React.useEffect(()=>{focus();},[]);
  React.useEffect(()=>{const fn=e=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',fn);return()=>document.removeEventListener('keydown',fn);},[onClose]);
  const choose=f=>{if(stage==='context'&&text.split(/[，,。\n]/).includes(f)){focus();return;}if(f==='作息不规律'){setText(f);setWhen('');setStage('detail');focus();return;}setText(v=>v.trim()?(v===when?v+f:v+'，'+f):f);setStage(steps[stage].next);focus();};
  const pickTime=t=>{setText(v=>t+v.replace(/^(昨晚|今天午睡)/,''));setWhen(t);setStage('feeling');focus();};
  const edit=(value,back=false)=>{
    const el=input.current,start=el?.selectionStart??text.length,end=el?.selectionEnd??start;
    const from=back&&start===end?Math.max(0,start-1):start;
    setText(text.slice(0,from)+value+text.slice(end));setStage(null);
    requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(from+value.length,from+value.length);});
  };
  const valid=!!text.trim()&&!['昨晚','今天午睡','最近'].includes(text.trim());
  const save=()=>{
    if(!valid||sent.current)return;sent.current=true;
    const raw=text.trim(),d=new Date();if(raw.startsWith('昨晚'))d.setDate(d.getDate()-1);
    const pad=n=>String(n).padStart(2,'0');
    const datetime=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    onSave({datetime,time:datetime.slice(11),text:raw,sleepRecord:{sleep_event:raw,...(/午睡|小睡/.test(raw)?{sleep_type:'nap'}:/昨晚|夜里|晚上/.test(raw)?{sleep_type:'night'}:{}),scope:/最近|近期|这几天|作息不规律/.test(raw)?'recent':'unspecified'},scheme:'sleep-1'});
  };
  return <div className="love-layer" role="dialog" aria-modal="true" aria-label="睡眠：方案一 · 感受与情境">
    <button className="love-dismiss" aria-label="取消睡眠记录" onClick={onClose}/>
    <div className="love-bottom">
      {stage==='context'&&<div className="sleep-context-hint">{steps[stage].prompt}</div>}
      {stage&&<div className="love-time-bubbles love-options love-method-scroll">
        {stage==='time'?['昨晚','今天午睡'].map(t=><button key={t} onClick={()=>pickTime(t)}>{t}</button>):<>
          {steps[stage].options.map(f=><button key={f} aria-pressed={stage==='context'?text.split(/[，,。\n]/).includes(f):undefined} onClick={()=>choose(f)}>{f}</button>)}
          {stage==='feeling'&&<button onClick={()=>setStage('time')}>补充时间</button>}
        </>}
      </div>}
      <div className="love-composer"><div className="med-natural-wrap">
        <textarea ref={input} className="love-natural-input" rows="2" aria-label="睡眠感受与背景" placeholder="这次睡得怎么样？" value={text} onChange={e=>{setText(e.target.value);setStage(null);}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();save();}}}/>
      </div><button className="love-send" disabled={!valid} aria-label="保存睡眠记录" onClick={save}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/></svg></button></div>
      {window.DockFakeKeyboard&&<window.DockFakeKeyboard onInsert={s=>edit(s)} onBackspace={()=>edit('',true)} onReturn={save}/>}
    </div>
  </div>;
}
window.SleepAutocomplete=SleepExperienceComposer;
