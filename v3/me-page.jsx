const {useEffect:useMeEffect, useState:useMeState} = React;

function MeBackIcon(){return <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>}
function MeHeartIcon(){return <svg viewBox="0 0 24 24"><path d="M12 21c-.3 0-.6-.1-.8-.3l-7-6.4A4.8 4.8 0 0 1 8 6.3c1.1 0 2.1.4 2.9 1.1L12 8.4l1.1-1c.8-.7 1.8-1.1 2.9-1.1a4.8 4.8 0 0 1 3.8 8l-7 6.4c-.2.2-.5.3-.8.3Z"/></svg>}
function MeLockIcon(){return <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>}

function PartnerPreviewHeader({title, onBack}){
  return <div className="partner-preview-nav"><button type="button" aria-label="返回" onClick={onBack}><MeBackIcon/></button><h2>{title}</h2></div>;
}

function PartnerAcceptPage({shareState, onClose, onAccept}){
  const enabled = (window.REVIEW_SHARE_MODULES || []).filter(item=>shareState?.modules?.[item.id]).map(item=>item.label);
  if(shareState?.status !== 'invited'){
    return <div className="partner-preview-screen"><PartnerPreviewHeader title="男友 App" onBack={onClose}/><div className="partner-preview-empty"><span>💌</span><h3>暂无待接受的邀请</h3><p>发送共享邀请后，可以在这里体验 TA 接受邀请的完整流程。</p></div></div>;
  }
  return (
    <div className="partner-preview-screen">
      <PartnerPreviewHeader title="" onBack={onClose}/>
      <div className="partner-accept">
        <div className="partner-accept-hero">💗</div>
        <h2><b>小柚</b> 邀请你<br/>一起关心她 💗</h2>
        <p>她愿意让你了解她的身体节律，这样你能更好地陪伴她、体贴她。</p>
        <div className="partner-see-list"><div className="partner-see-title">接受后你可以看到</div>{enabled.map(label=><div className="partner-see-item" key={label}><i>✓</i>{label}</div>)}<div className="partner-see-item is-private"><i>×</i>看不到她的记录时间轴与原文</div></div>
        <button type="button" className="partner-primary" onClick={onAccept}>打开美柚 · 接受邀请</button>
        <small>仅可查看，你无法编辑或修改她的任何记录</small>
      </div>
    </div>
  );
}

function PartnerTimeline(){
  return <div className="partner-body"><div className="partner-day"><i></i><b>今天</b><span>周三</span></div><div className="partner-thread"><article><time>12:50</time><p>午饭和同事去吃了顿火锅，有点上头，下午得多喝水。</p><em>饮食</em></article><article><time>08:30</time><p>早上沿江跑了 3 公里，久违地出了一身汗，一整天都清醒。</p><em className="is-green">运动</em></article></div><div className="partner-day"><i className="is-muted"></i><b>昨天</b><span>周二</span></div><div className="partner-thread"><article><time>21:10</time><p>给她带了杯热的红糖姜茶，她这两天不太舒服，多陪陪她。</p><em>心情</em></article></div></div>;
}

function PartnerHome(){
  return <div className="partner-body"><div className="partner-shared-by"><span>柚</span><div><b>小柚共享给你</b><small>一起关心她的经期 · 由她授权</small></div></div><div className="partner-care-hero"><small>她现在的状态</small><h3>经期第 2 天 <em>· 通常持续到第 6 天</em></h3><p><MeHeartIcon/>这几天她可能会有些不舒服，多点耐心和陪伴，一杯热水、一句关心都很暖。</p></div><div className="partner-predict"><span>📅</span><div><small>下次经期预计</small><b>7 月 12 日 <em>左右</em></b></div><i>提前 2 天提醒你</i></div></div>;
}

function PartnerReview(){
  return (
    <div className="partner-body partner-review-cards">
      <ReviewCard
        title="周期"
        icon={<ReviewDropletIcon/>}
        chart={<CycleChart/>}
        legend={(
          <>
            <span className="review-legend-item is-cycle"><i></i>周期天数</span>
            <span className="review-legend-item is-trend"><i></i>趋势</span>
            <span className="review-legend-item is-warning"><i></i>偏长周期</span>
          </>
        )}
        metrics={(
          <>
            <ReviewMetric value="28" unit="天" label="最近周期"/>
            <ReviewMetric value="29.7" unit="天" label="近一年平均"/>
            <ReviewMetric value="↘ 缩短" label="整体趋势" trend/>
          </>
        )}
        more="查看AI趋势分析"
        moreBadge="VIP"
      />
      <PeriodReviewCard/>
    </div>
  );
}

function PartnerMe({onOpenReview}){
  return <div className="partner-body"><div className="partner-me-head"><span>阿泽</span><div><b>阿泽</b><small>♥ 关心中 · 小柚</small></div></div><div className="partner-relation"><div><span>柚</span><p><b>小柚（伴侣）</b><small><i></i>已连接 · 今天起</small></p></div><button type="button" onClick={onOpenReview}>查看她共享的回顾</button></div><div className="partner-me-list"><div>🎙️<span>我的点滴</span><small>已记录 5 天</small>›</div><div>📈<span>我的回顾</span>›</div><div>🔔<span>消息与提醒</span>›</div></div><div className="partner-me-list"><div>🔒<span>隐私说明</span>›</div><div>⚙️<span>设置</span>›</div></div></div>;
}

function PartnerTabIcon({tab, active}){
  const icons = window.TABBAR_ICONS || {};
  const src = tab === 'home' ? icons.home
    : tab === 'me' ? icons.me
    : tab === 'diandi' ? (active ? (icons.noteActive || icons.note) : icons.note)
    : (active ? (icons.reviewActive || icons.review) : icons.review);
  return <img src={src} alt="" aria-hidden="true"/>;
}

function PartnerApp({shareState, onClose}){
  const [tab, setTab] = useMeState('home');
  const title = tab === 'home' ? '首页' : tab === 'diandi' ? '点滴' : tab === 'review' ? '回顾' : '我';
  const tabs = [{id:'home',label:'首页'},{id:'diandi',label:'点滴'},{id:'review',label:'回顾'},{id:'me',label:'我'}];
  return <div className="partner-preview-screen partner-app"><PartnerPreviewHeader title={title} onBack={onClose}/>{tab === 'home' ? <PartnerHome/> : tab === 'diandi' ? <PartnerTimeline/> : tab === 'review' ? <PartnerReview/> : <PartnerMe onOpenReview={()=>setTab('review')}/>}<div className="partner-tabs">{tabs.map(item=><button type="button" key={item.id} className={tab === item.id ? 'is-on' : ''} onClick={()=>setTab(item.id)}><span className="partner-tab-icon"><PartnerTabIcon tab={item.id} active={tab === item.id}/></span>{item.label}</button>)}</div></div>;
}

function PartnerPreview({open, shareState, onClose, onAccept}){
  const [acceptedInSession, setAcceptedInSession] = useMeState(false);
  useMeEffect(()=>{if(open) setAcceptedInSession(shareState?.status === 'accepted')}, [open, shareState?.status]);
  if(!open) return null;
  if(shareState?.status === 'accepted' || acceptedInSession) return <div className="partner-preview-overlay"><PartnerApp shareState={shareState} onClose={onClose}/></div>;
  return <div className="partner-preview-overlay"><PartnerAcceptPage shareState={shareState} onClose={onClose} onAccept={()=>{onAccept?.();setAcceptedInSession(true)}}/></div>;
}

function MePage({shareState, partnerPreviewOpen, onPartnerPreviewOpenChange, onShareStateChange}){
  const statusText = shareState?.status === 'accepted' ? '已连接 · 点击查看男友端' : shareState?.status === 'invited' ? '有一条待接受邀请' : '体验 TA 接受邀请后的页面';
  return <main className="me-page" aria-label="我"><div className="me-nav"><h1>我</h1><button type="button" aria-label="设置">⚙</button></div><div className="me-content"><div className="me-profile"><span>柚</span><div><b>小柚</b><small>记录生活，也关心自己</small></div></div><div className="me-section-title">共享体验</div><button type="button" className="me-partner-entry" onClick={()=>onPartnerPreviewOpenChange?.(true)}><span className="me-partner-entry-icon">💗</span><span><b>男友 App 体验</b><small>{statusText}</small></span><em>{shareState?.status === 'invited' ? '待接受' : shareState?.status === 'accepted' ? '已连接' : '预览'} ›</em></button><div className="me-list"><div><span>📒</span><b>我的记录</b><em>›</em></div><div><span>🔔</span><b>消息与提醒</b><em>›</em></div><div><span>🔒</span><b>隐私与设置</b><em>›</em></div></div></div><PartnerPreview open={partnerPreviewOpen} shareState={shareState} onClose={()=>onPartnerPreviewOpenChange?.(false)} onAccept={()=>onShareStateChange?.(current=>({...current,status:'accepted',acceptedAt:'今天'}))}/></main>;
}

window.MePage = MePage;
