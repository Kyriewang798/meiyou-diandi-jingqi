function FocusedTrendMiniChart({analysis}){
  const values = analysis?.values || [];
  const labels = analysis?.labels || [];
  if(values.length < 2) return null;

  const width = 260;
  const height = 78;
  const padX = 14;
  const padTop = 14;
  const padBottom = 20;
  const min = Math.min(...values) - 0.08;
  const max = Math.max(...values) + 0.08;
  const stepX = (width - padX * 2) / (values.length - 1);
  const points = values.map((value, index)=>({
    value,
    label:labels[index] || '',
    x:padX + index * stepX,
    y:padTop + ((max - value) / (max - min || 1)) * (height - padTop - padBottom),
  }));
  const polyline = points.map(point=>`${point.x},${point.y}`).join(' ');

  return (
    <section className="tl-focus-trend" aria-label={analysis.summary || analysis.title || '趋势图'}>
      <div className="tl-focus-trend-head"><b>{analysis.title || '近期趋势'}</b><span>{analysis.range || ''}</span></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={analysis.summary || '趋势变化'}>
        <line className="tl-focus-trend-grid" x1={padX} y1="24" x2={width-padX} y2="24"/>
        <line className="tl-focus-trend-grid" x1={padX} y1="47" x2={width-padX} y2="47"/>
        <polyline className="tl-focus-trend-line" points={polyline}/>
        {points.map((point,index)=>(
          <g key={`${point.label}-${index}`}>
            <circle className={'tl-focus-trend-dot'+(index === points.length-1 ? ' is-latest' : '')} cx={point.x} cy={point.y} r={index === points.length-1 ? 4 : 3}/>
            <text className="tl-focus-trend-value" x={point.x} y={Math.max(9, point.y-7)} textAnchor="middle">{point.value.toFixed(1)}</text>
            <text className="tl-focus-trend-label" x={point.x} y={height-3} textAnchor="middle">{point.label}</text>
          </g>
        ))}
      </svg>
      {analysis.summary ? <p><i aria-hidden="true">✦</i>{analysis.summary}</p> : null}
    </section>
  );
}

function FocusedInputFlowCard({item, isNew}){
  const stagedResults = item.flowVariant === 'three-paths';
  const [status, setStatus] = React.useState('idle');
  const [visibleRecords, setVisibleRecords] = React.useState(0);
  const [liveText, setLiveText] = React.useState('');
  const [sourceText, setSourceText] = React.useState(item.sourceText || '');
  const [sourceKind, setSourceKind] = React.useState(item.sourceKind || 'voice');
  const [duration, setDuration] = React.useState(item.duration || '0:12');
  const [playing, setPlaying] = React.useState(false);
  const [analysisOpen, setAnalysisOpen] = React.useState(false);
  const [savedAckVisible, setSavedAckVisible] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const timerRef = React.useRef(null);
  const savedAckTimerRef = React.useRef(null);
  const cardRef = React.useRef(null);

  const resolveResult = React.useCallback((text)=>{
    if(/下午\s*3点|下午三点/.test(text) && /头痛/.test(text) && /恶心/.test(text)){
      return {
        demoKind:'text-symptom',
        records:[
          {icon:'✚', subject:'我', item:'症状', value:'头痛'},
          {icon:'✚', subject:'我', item:'症状', value:'恶心'},
        ],
        feedback:'头痛从今天 15:00 持续至今，并同时记录到恶心；后续新增症状时，会继续帮你串联变化。',
        analysis:null,
        todayEntries:[
          {
            kind:'record-group', id:'focused-text-headache-today', isNew:true,
            primary:{
              id:'focused-text-headache-today-primary', time:'15:00', kind:'daily-record',
              recordType:'symptom', recordLabel:stagedResults ? '症状' : '我 · 症状', recordDetail:'头痛', icon:'symptom', tags:[],
            },
          },
          {
            kind:'record-group', id:'focused-text-nausea-today', isNew:true,
            primary:{
              id:'focused-text-nausea-today-primary', time:'19:00', kind:'daily-record',
              recordType:'symptom', recordLabel:stagedResults ? '症状' : '我 · 症状', recordDetail:'恶心', icon:'symptom', tags:[],
            },
          },
        ],
      };
    }
    if(/排便|便便/.test(text)){
      return {
        demoKind:'text-stool-no-analysis',
        records:[{icon:'💩', subject:'我', item:'便便', value:'排便困难'}],
        feedback:'',
        analysis:null,
        todayEntries:[
          {
            kind:'record-group', id:'focused-text-stool-today', isNew:true,
            primary:{
              id:'focused-text-stool-today-primary', time:'19:00', kind:'daily-record',
              recordType:'stool', recordLabel:'便便', recordDetail:'排便困难', icon:'stool', tags:[],
            },
          },
        ],
      };
    }
    if(/小林/.test(text) && /出去玩|出游|玩/.test(text)){
      return {
        records:[],
        feedback:'',
        analysis:null,
      };
    }
    if(text === item.sourceText || /体重|月经|担心/.test(text)){
      return {records:item.records || [], feedback:item.feedback || '', analysis:item.analysis || null};
    }
    return {records:[], feedback:'', analysis:null};
  }, [item.analysis, item.feedback, item.records, item.sourceText, stagedResults]);

  const result = React.useMemo(()=>resolveResult(sourceText), [resolveResult, sourceText]);
  const visibleResultRecords = (result.records || []).slice(0, visibleRecords);
  const displayedResultRecords = stagedResults
    ? visibleResultRecords.filter((record,index,records)=>records.findIndex(candidate=>(
        candidate.subject === record.subject && candidate.item === record.item
      )) === index)
    : visibleResultRecords;
  const hasMultipleSubjects = new Set(displayedResultRecords.map(record=>record.subject).filter(Boolean)).size > 1;
  const getRecordTagTone = (itemLabel)=>{
    if(itemLabel === '体重') return ' is-weight';
    if(itemLabel === '心情') return ' is-mood';
    if(itemLabel === '症状') return ' is-symptom';
    if(itemLabel === '月经来了') return ' is-period';
    return '';
  };
  const getSubjectTagTone = (subjectLabel)=>{
    if(/宝宝/.test(subjectLabel || '')) return ' is-baby';
    if(/丈夫|爸爸|儿子/.test(subjectLabel || '')) return ' is-male';
    if(/宠物/.test(subjectLabel || '')) return ' is-pet';
    return ' is-female';
  };

  React.useEffect(()=>{
    if(status !== 'processing') return;
    setVisibleRecords(0);
    const records = result.records || [];
    let timer = null;
    let cancelled = false;
    let nextVisibleRecord = 0;
    const revealNextRecord = ()=>{
      if(cancelled) return;
      nextVisibleRecord += 1;
      setVisibleRecords(nextVisibleRecord);
      if(nextVisibleRecord >= records.length){
        timer = setTimeout(()=>setStatus(stagedResults && result.feedback ? 'records-ready' : 'complete'), 520);
        return;
      }
      timer = setTimeout(revealNextRecord, 620);
    };
    timer = setTimeout(revealNextRecord, 1050);
    return ()=>{
      cancelled = true;
      clearTimeout(timer);
    };
  }, [run, status, result.feedback, result.records, stagedResults]);

  React.useEffect(()=>{
    if(status !== 'checking') return;
    const timer = setTimeout(()=>{
      setSavedAckVisible(true);
      clearTimeout(savedAckTimerRef.current);
      savedAckTimerRef.current = setTimeout(()=>{
        setSavedAckVisible(false);
        savedAckTimerRef.current = null;
      }, 1300);
      setStatus((result.records || []).length ? 'processing' : 'source-only-ack');
    }, 950);
    return ()=>clearTimeout(timer);
  }, [run, status, result.records]);

  React.useEffect(()=>{
    if(status !== 'source-only-ack') return;
    const timer = setTimeout(()=>setStatus('source-only'), 1350);
    return ()=>clearTimeout(timer);
  }, [status]);

  React.useEffect(()=>{
    if(status !== 'records-ready') return;
    const timer = setTimeout(()=>setStatus('complete'), 900);
    return ()=>clearTimeout(timer);
  }, [status]);

  React.useEffect(()=>{
    const stopTyping = ()=>{
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
    const stopSavedAck = ()=>{
      clearTimeout(savedAckTimerRef.current);
      savedAckTimerRef.current = null;
    };
    const bringIntoView = ()=>requestAnimationFrame(()=>{
      if(stagedResults && typeof window.scrollFocusedEntryToCenter === 'function'){
        window.scrollFocusedEntryToCenter(item.id, 'smooth');
        return;
      }
      document.querySelector('[data-entry-id="'+item.id+'"]')?.scrollIntoView({behavior:'smooth', block:'center'});
    });
    const onVoiceStart = (event)=>{
      const text = event?.detail?.text || item.sourceText || '';
      stopTyping();
      stopSavedAck();
      window.dispatchEvent(new CustomEvent('focusedDemoRetroRecordReset'));
      setSourceKind('voice');
      setSourceText(text);
      setLiveText('');
      setVisibleRecords(0);
      setSavedAckVisible(false);
      setStatus('recording');
      let cursor = 0;
      timerRef.current = setInterval(()=>{
        cursor += 1;
        setLiveText(text.slice(0, cursor));
        if(cursor >= text.length) stopTyping();
      }, 58);
      bringIntoView();
    };
    const onSubmit = (event)=>{
      const text = (event?.detail?.text || item.sourceText || '').trim();
      stopTyping();
      stopSavedAck();
      window.dispatchEvent(new CustomEvent('focusedDemoRetroRecordReset'));
      setPlaying(false);
      setAnalysisOpen(false);
      setSourceText(text);
      setLiveText(text);
      setSourceKind(event?.detail?.sourceKind || 'voice');
      setDuration(event?.detail?.duration ? `0:${String(event.detail.duration).padStart(2,'0')}` : item.duration || '0:12');
      setVisibleRecords(0);
      setSavedAckVisible(false);
      setStatus('checking');
      setRun(value=>value + 1);
      bringIntoView();
    };
    window.addEventListener('focusedDemoVoiceStart', onVoiceStart);
    window.addEventListener('focusedDemoSubmit', onSubmit);
    return ()=>{
      stopTyping();
      stopSavedAck();
      window.removeEventListener('focusedDemoVoiceStart', onVoiceStart);
      window.removeEventListener('focusedDemoSubmit', onSubmit);
    };
  }, [item.duration, item.id, item.sourceText, resolveResult, stagedResults]);

  React.useEffect(()=>{
    if(status === 'idle') return;
    if(stagedResults) return;
    requestAnimationFrame(()=>window.scrollFeedContentIntoView?.(cardRef.current));
  }, [status, visibleRecords, liveText, stagedResults]);

  React.useEffect(()=>{
    if(status === 'complete' && result.feedback){
      setAnalysisOpen(true);
    }
    const recordsAreReady = stagedResults
      ? status === 'records-ready' || status === 'complete'
      : status === 'complete';
    if(!recordsAreReady) return;
    if(Array.isArray(result.todayEntries) && result.todayEntries.length){
      setTimeout(()=>window.dispatchEvent(new CustomEvent('focusedDemoRetroRecordReady', {
        detail:{todayEntries:result.todayEntries},
      })), 0);
      return;
    }
    const retroRecord = (result.records || []).find(record=>(
      record.subject === '大女儿'
      && record.item === '月经来了'
      && String(record.value || '').includes('昨天')
    ));
    if(!retroRecord) return;
    setTimeout(()=>window.dispatchEvent(new CustomEvent('focusedDemoRetroRecordReady', {
      detail:{
        entry:{
          kind:'record-group',
          id:'focused-daughter-period-yesterday',
          isNew:true,
          primary:{
            id:'focused-daughter-period-yesterday-primary',
            time:'21:00',
            kind:'period',
            periodLabel:'大女儿 · 月经来了',
          },
        },
        todayEntries:[
          {
            kind:'record-group',
            id:'focused-baby-weight-today',
            isNew:true,
            primary:{
              id:'focused-baby-weight-today-primary',
              time:'19:00',
              kind:'daily-record',
              recordType:'weight',
              recordLabel:'宝宝 · 体重',
              recordDetail:'9.3 公斤',
              icon:'weight',
            },
          },
          {
            kind:'record-group',
            id:'focused-self-mood-today',
            isNew:true,
            primary:{
              id:'focused-self-mood-today-primary',
              time:'19:00',
              kind:'daily-record',
              recordType:'mood',
              recordLabel:stagedResults ? '心情' : '我 · 心情',
              recordDetail:'担心',
              icon:'mood',
            },
          },
        ],
      },
    })), 0);
  }, [status, result.feedback, stagedResults]);

  if(status === 'idle') return null;

  const isDone = status === 'complete' || status === 'source-only';
  const isProcessing = status === 'processing';
  const isAnalyzing = status === 'records-ready';
  const isChecking = status === 'checking';
  const showAiLoading = isProcessing || isAnalyzing;
  return (
    <article
      ref={cardRef}
      className={'tl-focus-flow'+(isNew ? ' fade-in' : '')}
      data-entry-id={item.id}
    >
      <header className="tl-focus-time"><time>{item.time}</time></header>

      {status === 'recording' ? (
        <section className="tl-focus-live-card" aria-label="实时转录">
          <div className="tl-focus-live-head">
            <span><i/>实时转录</span>
            <span className="tl-focus-wave" aria-hidden="true">
              {[7,12,8,15,10,6,13,9,16,8,12,7].map((height,index)=><i key={index} style={{'--wave-h':height+'px','--wave-i':index}}/>)}
            </span>
          </div>
          <p>{liveText || '正在聆听…'}<span className="tl-focus-caret" aria-hidden="true"/></p>
        </section>
      ) : (
        <section className="tl-focus-entry-card" aria-label="本次记录">
          {!isChecking ? (
            <div className="tl-focus-source-zone">
              <div className="tl-focus-source-body">
                {sourceKind === 'voice' ? (
                  <button type="button" className={'tl-focus-play'+(playing ? ' is-playing' : '')} onClick={()=>setPlaying(value=>!value)}>
                    <span>{playing ? 'Ⅱ' : '▶'}</span>{duration}</button>
                ) : null}
                <p>{sourceText}</p>
              </div>
            </div>
          ) : null}

          {savedAckVisible ? (
            <div className={'tl-focus-saved-ack'+(savedAckVisible ? ' is-visible' : '')} role="status" aria-live="polite">
              <b>已记录</b>
              <span aria-hidden="true">✓</span>
            </div>
          ) : null}

          {isChecking ? (
            <div className="tl-focus-processing tl-focus-checking-processing" role="status" aria-live="polite">
              <span className="tl-focus-saving-spinner" aria-hidden="true"/>
              <span><b>记录中</b></span>
              <span className="tl-focus-dots" aria-hidden="true"><i/><i/><i/></span>
            </div>
          ) : null}

          {showAiLoading ? (
            <div className="tl-focus-processing" role="status" aria-live="polite">
              <span className="tl-focus-spark" aria-hidden="true">✦</span>
              <span><b>AI 分析中</b></span>
              <span className="tl-focus-dots" aria-hidden="true"><i/><i/><i/></span>
            </div>
          ) : null}

          {visibleRecords > 0 ? (
            <div className={'tl-focus-fields'+(hasMultipleSubjects ? ' has-multiple-subjects' : '')} aria-label={`已提取 ${displayedResultRecords.length} 条记录`}>
              {displayedResultRecords.map((record,index)=>(
                <div className="tl-focus-field-group" key={`${record.subject}-${record.item}-${index}`}>
                  {(!stagedResults || record.subject !== '我' || hasMultipleSubjects) ? <span className={'tl-focus-field-subject'+getSubjectTagTone(record.subject)}>{record.subject}</span> : null}
                  <span className={'tl-focus-field-item'+getRecordTagTone(record.item)}>{record.item}</span>
                  {!stagedResults && record.value ? <span className="tl-focus-field-value">{record.value}</span> : null}
                  {!stagedResults && record.meta ? <span className="tl-focus-field-value">{record.meta}</span> : null}
                </div>
              ))}
            </div>
          ) : null}

          {isDone && result.feedback ? (
            <div className={'tl-focus-analysis'+(analysisOpen ? ' is-open' : '')}>
              <button type="button" onClick={()=>setAnalysisOpen(value=>!value)} aria-expanded={analysisOpen}>
                <span><i aria-hidden="true">✦</i><b>AI 分析</b></span>
                <span><i aria-hidden="true">⌄</i></span>
              </button>
              {analysisOpen ? (
                <div className="tl-focus-analysis-body">
                  <p>{result.feedback}</p>
                  {result.analysis ? <FocusedTrendMiniChart analysis={result.analysis}/> : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      )}
    </article>
  );
}

Object.assign(window, { FocusedInputFlowCard });
