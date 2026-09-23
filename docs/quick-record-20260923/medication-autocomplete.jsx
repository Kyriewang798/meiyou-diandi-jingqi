/* 用药：一次一条；字段来自用户点选或输入，历史只复用药名。 */
function MedicationQuickComposer({onClose,onSave,recents=[]}){
  const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const [when,setWhen]=React.useState('');
  const [drug,setDrug]=React.useState('');
  const [dose,setDose]=React.useState('');
  const [unit,setUnit]=React.useState('');
  const [route,setRoute]=React.useState('');
  const [note,setNote]=React.useState('');
  const [active,setActive]=React.useState('drug');
  const field=React.useRef(null),noteRef=React.useRef(null),sent=React.useRef(false);
  const routes={oral:'口服',topical:'外用',injection:'注射'};
  const focusNote=()=>requestAnimationFrame(()=>noteRef.current?.focus());
  React.useEffect(()=>{const fn=e=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',fn);return()=>document.removeEventListener('keydown',fn);},[onClose]);
  React.useEffect(()=>{if(active==='drug'||active==='dose')field.current?.focus();},[active]);
  const invalid=(when&&(!Number.isFinite(new Date(when).getTime())||new Date(when)>new Date()))||(dose!==''&&(!Number.isFinite(Number(dose))||Number(dose)<0));
  const save=()=>{
    if(invalid||sent.current)return;
    sent.current=true;
    const datetime=when||localDate(new Date());
    const content={completed:true};
    if(drug.trim())content.drug_name=drug.trim();
    if(dose!==''){content.dose=Number(dose);if(unit.trim())content.dose_unit=unit.trim();}
    if(route)content.route=route;
    const details=[drug.trim(),dose!==''?(unit.trim()?`${dose}${unit.trim()}`:`剂量${dose}（单位未记录）`):'',routes[route]].filter(Boolean);
    onSave({datetime,time:datetime.slice(11),text:`用药：${details.length?details.join(' · '):'已用药'}${note.trim()?'，'+note.trim():''}`,medication:content,note:note.trim(),eventDatetime:when||null});
  };
  const finish=()=>{setActive(null);focusNote();};
  const currentValue=active==='drug'?drug:active==='dose'?dose:note;
  const currentSet=active==='drug'?setDrug:active==='dose'?setDose:setNote;
  const keyboardEdit=(s,back=false)=>{
    const el=active==='drug'||active==='dose'?field.current:noteRef.current;
    const start=el?.selectionStart??currentValue.length,end=el?.selectionEnd??start;
    const from=back&&start===end?Math.max(0,start-1):start;
    currentSet(currentValue.slice(0,from)+s+currentValue.slice(end));
    requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(from+s.length,from+s.length);});
  };
  const timeLabel=when?`${new Date(when).getMonth()+1}月${new Date(when).getDate()}日 ${when.slice(11)}`:'时间';
  return <div className="love-layer" role="dialog" aria-modal="true" aria-label="用药：方案一 · 轻补全">
    <button className="love-dismiss" aria-label="取消用药记录" onClick={onClose}/>
    <div className="love-bottom">
      {active==='drug'&&<>
        {recents.length>0&&<div className="love-time-bubbles love-options love-method-scroll" aria-label="最近记录的药名">{recents.map(name=><button key={name} onClick={()=>{setDrug(name);requestAnimationFrame(()=>field.current?.focus());}}>{name}</button>)}</div>}

      </>}
      {active==='time'&&<div className="love-time-bubbles love-options love-method-scroll">
        {['现在','今天早上','昨天'].map((label,i)=><button key={label} onClick={()=>{const d=new Date();if(i===1)d.setHours(Math.min(8,d.getHours()),0,0,0);if(i===2)d.setDate(d.getDate()-1);setWhen(localDate(d));finish();}}>{label}</button>)}
        <button onClick={()=>setActive('date')}>其他时间</button>
      </div>}
      {active==='date'&&<div className="love-suggestions">
        <input type="datetime-local" aria-label="用药时间" max={localDate(new Date())} value={when} onChange={e=>setWhen(e.target.value)}/>
        <button className="love-next" disabled={!when||!!invalid} onClick={finish}>确定</button>
      </div>}
      {active==='dose'&&<>
        <div className="love-time-bubbles love-options love-method-scroll">{['片','粒','mg','ml','包','滴'].map(u=><button key={u} aria-pressed={unit===u} onClick={()=>{setUnit(u);requestAnimationFrame(()=>field.current?.focus());}}>{u}</button>)}</div>

      </>}
      {active==='route'&&<div className="love-time-bubbles love-options love-method-scroll">{Object.entries(routes).map(([key,label])=><button key={key} onClick={()=>{setRoute(key);finish();}}>{label}</button>)}<button onClick={()=>{setRoute('');finish();}}>不填方式</button></div>}
      <div className="love-composer"><div className="love-sentence"><span className="love-prefix">用药</span>
        <input ref={active==='drug'?field:undefined} className={'love-token med-inline-drug '+(active==='drug'?'active':'')} style={{width:Math.min(160,Math.max(44,drug.length*14+16))}} aria-label="药名" placeholder="药名" value={drug} onFocus={()=>setActive('drug')} onChange={e=>setDrug(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();finish();}}}/>

        {[['time',timeLabel],['dose',dose?dose+unit:'剂量'],['route',routes[route]||'方式']].map(([key,label])=>key==='dose'?<span key={key} className={'love-token med-inline-dose '+(active==='dose'?'active':'')}><input ref={active==='dose'?field:undefined} aria-label="剂量数值" inputMode="decimal" placeholder="剂量" value={dose} style={{width:Math.max(28,dose.length*9)}} onFocus={()=>setActive('dose')} onChange={e=>setDose(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();finish();}}}/>{unit&&<span onClick={()=>{setActive('dose');requestAnimationFrame(()=>field.current?.focus());}}>{unit}</span>}</span>:<button key={key} className={'love-token '+(active===key?'active':'')} onClick={()=>setActive(active===key?null:key)} onKeyDown={e=>{if(['Backspace','Delete'].includes(e.key)){e.preventDefault();if(key==='drug')setDrug('');if(key==='time')setWhen('');if(key==='dose'){setDose('');setUnit('');}if(key==='route')setRoute('');finish();}}}>{label}</button>)}
        <input ref={noteRef} className="love-free-input" aria-label="用药自由备注" value={note} onFocus={()=>setActive(null)} onChange={e=>setNote(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();save();}}}/>
      </div><button className="love-send" disabled={!!invalid} aria-label="保存用药记录" onClick={save}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/></svg></button></div>
      {window.DockFakeKeyboard&&<window.DockFakeKeyboard onInsert={s=>keyboardEdit(s)} onBackspace={()=>keyboardEdit('',true)} onReturn={active?finish:save}/>}
    </div>
  </div>;
}
/* 方案二：单输入框。仅演示明确表达的简单提取，不猜药物或剂量。 */
function MedicationNaturalComposer({onClose,onSave,recents=[]}){
  const [text,setText]=React.useState('用药');
  const [stage,setStage]=React.useState('time');
  const [hint,setHint]=React.useState('');
  const input=React.useRef(null),sent=React.useRef(false);
  const canSave=!!text.trim()&&! /^(现在|昨天|今天|前天|刚刚)?(用了|吃了|服用了)$/.test(text.trim());
  React.useEffect(()=>{
    const el=input.current;el?.focus();el?.setSelectionRange(el.value.length,el.value.length);
  },[]);
  React.useEffect(()=>{const fn=e=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',fn);return()=>document.removeEventListener('keydown',fn);},[onClose]);
  const edit=(value,back=false)=>{
    const el=input.current,start=el?.selectionStart??text.length,end=el?.selectionEnd??start;
    const from=back&&start===end?Math.max(0,start-1):start;
    setText(text.slice(0,from)+value+text.slice(end));setHint('');if(stage==='time'||stage==='drug')setStage('details');
    requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(from+value.length,from+value.length);});
  };
  const focusEnd=()=>requestAnimationFrame(()=>{const el=input.current;el?.focus();el?.setSelectionRange(el.value.length,el.value.length);});
  const pickTime=label=>{setText(v=>/^(用药|用了)$/.test(v)?label+'用了':label+v.replace(/^(现在|昨天|今天|前天|刚刚)/,''));setHint('药名？');setStage('details');focusEnd();};
  const pickDose=()=>{setText(v=>v.replace(/[，,\s]+$/,'')+'，');setHint('剂量？');setStage('dose');focusEnd();};
  const pickRoute=value=>{setText(v=>v.replace(/[，,\s]+$/,'')+'，'+value);setHint('');setStage(null);focusEnd();};
  const save=()=>{
    if(!canSave||sent.current)return;
    sent.current=true;
    const raw=text.trim(),content={};
    // Preserve the original sentence; extraction here is deliberately limited to simple mock cases.
    const match=raw.split(/[，,]/)[0].match(/^(?:(?:现在|今天|昨天|前天|昨晚|早上|晚上|刚刚)[，,\s]*)*(用了|吃了|服用了|喝了|涂了|抹了)([^，,。！？]+)[。！]?$/);
    if(match){
      content.completed=true;
      const detail=match[2],dose=raw.match(/(\d+(?:\.\d+)?|一|两|二|半)\s*(片|粒|mg|ml|包|滴)/i);
      const name=detail.replace(/(\d+(?:\.\d+)?|一|两|二|半)\s*(片|粒|mg|ml|包|滴)/ig,'').trim();
      if(name&&name!=='药')content.drug_name=name;
      if(dose){content.dose=({一:1,两:2,二:2,半:.5})[dose[1]]??Number(dose[1]);content.dose_unit=dose[2];}
      if(['吃了','服用了','喝了'].includes(match[1]))content.route='oral';
      if(['涂了','抹了'].includes(match[1]))content.route='topical';
    }else if(/^(用药|吃药了|用药了|已用药|已吃药)$/.test(raw))content.completed=true;
    if(/(?:^|[，,])口服(?:$|[，,])/.test(raw))content.route='oral';
    if(/(?:^|[，,])外用(?:$|[，,])/.test(raw))content.route='topical';
    if(/(?:^|[，,])注射(?:$|[，,])/.test(raw))content.route='injection';
    const d=new Date();if(raw.startsWith('前天'))d.setDate(d.getDate()-2);else if(/^(昨天|昨晚)/.test(raw))d.setDate(d.getDate()-1);
    const pad=n=>String(n).padStart(2,'0');
    const datetime=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    onSave({datetime,time:datetime.slice(11),text:raw,medication:content,scheme:'medication-2'});
  };
  return <div className="love-layer" role="dialog" aria-modal="true" aria-label="用药：方案二 · 自然续写">
    <button className="love-dismiss" aria-label="取消用药记录" onClick={onClose}/>
    <div className="love-bottom">
      {stage&&<div className="love-time-bubbles love-options love-method-scroll">
        {stage==='time'?['现在','昨天','前天'].map(t=><button key={t} onClick={()=>pickTime(t)}>{t}</button>):
         stage==='route'?['口服','外用','注射'].map(r=><button key={r} onClick={()=>pickRoute(r)}>{r}</button>):
         stage==='dose'?<>{['片','粒','mg','ml','包','滴'].map(u=><button key={u} onClick={()=>{edit(u);setStage('details');}}>{u}</button>)}<button onClick={()=>{setHint('');setStage('details');focusEnd();}}>完成</button></>:
         <><button onClick={pickDose}>剂量</button><button onClick={()=>{setStage('route');setHint('');focusEnd();}}>方式</button>{hint==='药名？'&&recents.map(name=><button key={name} onClick={()=>edit(name)}>{name}</button>)}</>}
      </div>}
      <div className="love-composer">
        <div className="med-natural-wrap">
          {hint&&<div className="med-natural-hint" aria-hidden="true"><span>{text}</span><b>{hint}</b></div>}
          <textarea ref={input} className="love-natural-input" rows="2" aria-label="用药自然语言记录" value={text} onChange={e=>{setText(e.target.value);setHint('');if(stage==='time')setStage('details');}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();save();}}}/>
        </div>
        <button className="love-send" disabled={!canSave} aria-label="保存用药记录" onClick={save}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4.1 11.15c-.62-.25-.6-.9.04-1.1L19.55 3.7c.62-.2 1.12.36.88.95L14.7 20.55c-.22.54-.9.58-1.18.06L10.7 14.4 4.1 11.15z"/></svg></button>
      </div>
      {window.DockFakeKeyboard&&<window.DockFakeKeyboard onInsert={s=>edit(s)} onBackspace={()=>edit('',true)} onReturn={save}/>}
    </div>
  </div>;
}
window.MedicationAutocomplete=function MedicationScheme(props){return props.scheme==='medication-2'?<MedicationNaturalComposer {...props}/>:<MedicationQuickComposer {...props}/>;};
