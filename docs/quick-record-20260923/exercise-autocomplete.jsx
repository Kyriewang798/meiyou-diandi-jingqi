/* 运动：运动项直选，自由续写。 */
function ExerciseQuickComposer({onClose,onSave}){
  const [text,setText]=React.useState('');
  const [showOptions,setShowOptions]=React.useState(true);
  const input=React.useRef(null),sent=React.useRef(false);
  const focus=()=>requestAnimationFrame(()=>{const el=input.current;el?.focus();el?.setSelectionRange(el.value.length,el.value.length);});
  React.useEffect(()=>{focus();},[]);
  React.useEffect(()=>{const fn=e=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',fn);return()=>document.removeEventListener('keydown',fn);},[onClose]);
  const choose=f=>{setText(f);setShowOptions(false);focus();};
  const edit=(value,back=false)=>{
    const el=input.current,start=el?.selectionStart??text.length,end=el?.selectionEnd??start;
    const from=back&&start===end?Math.max(0,start-1):start;
    setText(text.slice(0,from)+value+text.slice(end));setShowOptions(false);
    requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(from+value.length,from+value.length);});
  };
  const valid=!!text.trim();
  const save=()=>{
    if(!valid||sent.current)return;sent.current=true;
    const raw=text.trim(),d=new Date();
    const pad=n=>String(n).padStart(2,'0');
    const datetime=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    onSave({datetime,time:datetime.slice(11),text:raw,exerciseRecord:{text:raw},scheme:'exercise-1'});
  };
  return <div className="love-layer" role="dialog" aria-modal="true" aria-label="运动：方案一 · 运动项直选">
    <button className="love-dismiss" aria-label="取消运动记录" onClick={onClose}/>
    <div className="love-bottom">
      {showOptions&&<div className="love-time-bubbles love-options love-method-scroll">
        {['跳舞','游泳','慢跑','散步','快走','瑜伽','普拉提','骑行','跳绳','力量训练','羽毛球','乒乓球','篮球','爬山'].map(f=><button key={f} onClick={()=>choose(f)}>{f}</button>)}
      </div>}
      <div className="love-composer"><div className="med-natural-wrap">
        <textarea ref={input} className="love-natural-input" rows="2" aria-label="运动记录" value={text} onChange={e=>{setText(e.target.value);setShowOptions(false);}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();save();}}}/>
      </div><button className="love-send" disabled={!valid} aria-label="保存运动记录" onClick={save}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/></svg></button></div>
      {window.DockFakeKeyboard&&<window.DockFakeKeyboard onInsert={s=>edit(s)} onBackspace={()=>edit('',true)} onReturn={save}/>}
    </div>
  </div>;
}
window.ExerciseAutocomplete=ExerciseQuickComposer;
