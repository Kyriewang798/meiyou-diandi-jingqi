const {useEffect:useRsfEffect, useMemo:useRsfMemo, useState:useRsfState} = React;

const REVIEW_SHARE_MODULES = [
  {id:'cycle', group:'basic', label:'周期规律与下次预测', desc:'让 TA 提前知道、提前体贴'},
  {id:'period', group:'basic', label:'当前经期状态', desc:'来了 / 第几天 / 走了'},
  {id:'care', group:'basic', label:'贴心提醒', desc:'按经期阶段给 TA 的温和提示'},
  {id:'mood', group:'private', label:'情绪回顾'},
  {id:'symptom', group:'private', label:'症状回顾'},
  {id:'weight', group:'private', label:'体重'},
  {id:'intimate', group:'private', label:'亲密记录'},
];

function ReviewShareBackIcon(){
  return <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>;
}

function ReviewShareHeartIcon(){
  return <svg viewBox="0 0 24 24"><path d="M12 21c-.3 0-.6-.1-.8-.3l-7-6.4A4.8 4.8 0 0 1 8 6.3c1.1 0 2.1.4 2.9 1.1L12 8.4l1.1-1c.8-.7 1.8-1.1 2.9-1.1a4.8 4.8 0 0 1 3.8 8l-7 6.4c-.2.2-.5.3-.8.3Z"/></svg>;
}

function ReviewShareLockIcon(){
  return <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}

function ReviewShareHeader({title, onBack}){
  return (
    <div className="rsf-nav">
      <button type="button" className="rsf-back" aria-label="返回" onClick={onBack}><ReviewShareBackIcon/></button>
      <h2>{title}</h2>
    </div>
  );
}

function ReviewShareScene({onBack, onPartner, onFamily}){
  return (
    <div className="rsf-screen">
      <ReviewShareHeader title="共享回顾" onBack={onBack}/>
      <div className="rsf-scroll rsf-scene-page">
        <p className="rsf-intro">选择要共享给谁。我们会为不同关系准备好合适的默认内容，敏感信息默认不共享。</p>
        <button type="button" className="rsf-scene-card" onClick={onPartner}>
          <span className="rsf-scene-icon is-partner"><ReviewShareHeartIcon/></span>
          <span className="rsf-scene-copy"><b>共享给伴侣</b><small>让 TA 更懂你，一起关心经期。仅限一位伴侣。</small></span>
          <span className="rsf-chevron">›</span>
        </button>
        <button type="button" className="rsf-scene-card" onClick={onFamily}>
          <span className="rsf-scene-icon is-family">👪</span>
          <span className="rsf-scene-copy"><b>共享给家人</b><small>一起记录、查看宝宝的喂养回顾。可添加多位家人。</small><em>本 demo 示意</em></span>
          <span className="rsf-chevron">›</span>
        </button>
      </div>
    </div>
  );
}

function ReviewShareAuthorization({modules, onToggle, onBack, onNext, editing}){
  const enabledLabels = REVIEW_SHARE_MODULES.filter(item=>modules?.[item.id]).map(item=>item.label);
  const renderGroup = group=>REVIEW_SHARE_MODULES.filter(item=>item.group === group).map(item=>(
    <div className="rsf-switch-row" key={item.id}>
      <span><b>{item.label}</b>{item.desc ? <small>{item.desc}</small> : null}</span>
      <button type="button" className={'rsf-switch' + (modules?.[item.id] ? ' is-on' : '')} aria-pressed={Boolean(modules?.[item.id])} aria-label={(modules?.[item.id] ? '关闭' : '开启') + item.label} onClick={()=>onToggle(item.id)}><i></i></button>
    </div>
  ));
  return (
    <div className="rsf-screen">
      <ReviewShareHeader title="共享给伴侣" onBack={onBack}/>
      <div className="rsf-scroll rsf-auth-page">
        <div className="rsf-privacy"><ReviewShareLockIcon/><p>TA 只能看到你在下方勾选的回顾内容，<b>看不到你的点滴时间轴和任何原始记录</b>。</p></div>
        <div className="rsf-group-label">基础关心 <em>默认共享</em></div>
        <div className="rsf-switch-list">{renderGroup('basic')}</div>
        <div className="rsf-group-label">更私密的内容 <em className="is-sensitive">需手动开启</em></div>
        <div className="rsf-switch-list">{renderGroup('private')}</div>
        <div className="rsf-preview"><small>TA 会看到</small><p>{enabledLabels.length ? enabledLabels.join('、') : '尚未选择任何内容'}</p></div>
      </div>
      <div className="rsf-footer"><button type="button" className="rsf-primary" disabled={!enabledLabels.length} onClick={onNext}>{editing ? '保存修改' : '生成邀请'}</button></div>
    </div>
  );
}

function ReviewShareInvite({sent, onBack, onSend, onCopy, onQr, onPreview}){
  return (
    <div className="rsf-screen">
      <ReviewShareHeader title="邀请 TA" onBack={onBack}/>
      <div className="rsf-scroll rsf-invite-page">
        <div className="rsf-wechat-card">
          <p>我想让你更懂我，<br/>一起关心我的经期 💗</p>
          <div className="rsf-wechat-preview"><span><ReviewShareHeartIcon/></span><div><b>小柚 邀请你一起关心她</b><small>来自美柚 · 点击查看她的经期回顾</small></div></div>
        </div>
        <div className="rsf-send-ways">
          <button type="button" onClick={onSend}><i className="is-wx">微信</i><span>微信好友</span></button>
          <button type="button" onClick={onCopy}><i className="is-link">↗</i><span>复制链接</span></button>
          <button type="button" onClick={onQr}><i className="is-qr">▦</i><span>二维码</span></button>
        </div>
        <p className="rsf-expire">邀请 7 天内有效 · 需 TA 接受后才会建立共享</p>
        {sent ? <div className="rsf-sent"><i>✓</i><span><b>邀请已发送</b><small>等待 TA 接受后建立共享</small></span></div> : null}
        <button type="button" className="rsf-preview-entry" onClick={onPreview}>◉ 预览 TA 接受后看到的体验</button>
      </div>
    </div>
  );
}

function ReviewShareManage({shareState, enabledLabels, onBack, onEdit, onCancel, onFamily}){
  const accepted = shareState.status === 'accepted';
  return (
    <div className="rsf-screen">
      <ReviewShareHeader title="共享管理" onBack={onBack}/>
      <div className="rsf-scroll rsf-manage-page">
        <div className="rsf-section-title">我共享出去的</div>
        <div className="rsf-manage-card">
          <div className="rsf-member"><span className="rsf-avatar">阿泽</span><div><b>阿泽（伴侣）</b><small className={accepted ? 'is-connected' : 'is-pending'}><i></i>{accepted ? '已连接 · 今天起' : '等待接受邀请'}</small></div></div>
          <div className="rsf-visible"><span>TA 能看到：</span>{enabledLabels.join('、') || '尚未选择内容'}</div>
          <div className="rsf-manage-actions"><button type="button" onClick={onEdit}>修改可见内容</button><button type="button" className="is-danger" onClick={onCancel}>{accepted ? '取消共享' : '取消邀请'}</button></div>
        </div>
        {accepted ? (
          <button type="button" className="rsf-family-share-card" onClick={onFamily}>
            <span className="rsf-family-share-icon" aria-hidden="true">👪</span>
            <span className="rsf-family-share-copy">
              <b>共享给家人</b>
              <small>一起记录、查看宝宝的喂养回顾。可添加多位家人。</small>
              <em>本 demo 示意</em>
            </span>
            <span className="rsf-family-share-chevron" aria-hidden="true">›</span>
          </button>
        ) : null}
        <div className="rsf-section-title">共享给我的</div>
        <div className="rsf-empty">还没有人把回顾共享给你</div>
      </div>
    </div>
  );
}

function ReviewShareFlow({open, shareState, onShareStateChange, onClose, onOpenPartnerPreview}){
  const [screen, setScreen] = useRsfState('scene');
  const [editing, setEditing] = useRsfState(false);
  const [toastText, setToastText] = useRsfState('');
  const [confirmOpen, setConfirmOpen] = useRsfState(false);
  const modules = shareState?.modules || {};
  const enabledLabels = useRsfMemo(()=>REVIEW_SHARE_MODULES.filter(item=>modules[item.id]).map(item=>item.label), [modules]);

  useRsfEffect(()=>{
    if(!open) return;
    setScreen(shareState?.status === 'invited' || shareState?.status === 'accepted' ? 'manage' : 'scene');
    setEditing(false);
    setConfirmOpen(false);
  }, [open]);

  const updateShare = updater=>onShareStateChange?.(updater);
  const showToast = text=>{
    setToastText(text);
    window.setTimeout(()=>setToastText(''), 1800);
  };
  const markInvited = ()=>{
    updateShare(current=>({...current, status:'invited', partnerName:'阿泽', invitedAt:'今天'}));
  };
  const toggleModule = id=>updateShare(current=>({...current, modules:{...current.modules, [id]:!current.modules?.[id]}}));
  const revoke = ()=>{
    updateShare(current=>({...current, status:'idle', partnerName:'', invitedAt:''}));
    setConfirmOpen(false);
    showToast('已取消共享');
    window.setTimeout(()=>onClose?.(), 420);
  };

  return (
    <section className={'rsf-flow' + (open ? ' is-open' : '')} aria-hidden={!open} aria-label="回顾共享流程">
      {screen === 'scene' ? <ReviewShareScene onBack={onClose} onPartner={()=>setScreen('auth')} onFamily={()=>showToast('家人场景复用同一套框架，本 demo 聚焦伴侣流程')}/> : null}
      {screen === 'auth' ? <ReviewShareAuthorization modules={modules} onToggle={toggleModule} editing={editing} onBack={()=>{setScreen(editing ? 'manage' : 'scene');setEditing(false);}} onNext={()=>{if(editing){setEditing(false);setScreen('manage');showToast('可见内容已更新');}else setScreen('invite');}}/> : null}
      {screen === 'invite' ? <ReviewShareInvite sent={shareState?.status === 'invited' || shareState?.status === 'accepted'} onBack={()=>setScreen('auth')} onSend={()=>{markInvited();showToast('已发送给 TA，等待接受');}} onCopy={()=>showToast('链接已复制')} onQr={()=>showToast('二维码已生成')} onPreview={()=>{if(shareState?.status === 'idle') markInvited();onOpenPartnerPreview?.();}}/> : null}
      {screen === 'manage' ? <ReviewShareManage shareState={shareState} enabledLabels={enabledLabels} onBack={onClose} onEdit={()=>{setEditing(true);setScreen('auth');}} onCancel={()=>setConfirmOpen(true)} onFamily={()=>showToast('家人共享场景复用同一套框架，本 demo 暂不展开')}/> : null}
      <div className={'rsf-toast' + (toastText ? ' is-show' : '')} role="status">{toastText}</div>
      {confirmOpen ? <><button type="button" className="rsf-mask" aria-label="关闭" onClick={()=>setConfirmOpen(false)}></button><div className="rsf-sheet" role="dialog" aria-modal="true"><h3>{shareState?.status === 'accepted' ? '取消对阿泽的共享？' : '取消这次邀请？'}</h3><p>{shareState?.status === 'accepted' ? '取消后 TA 会立即无法查看你的任何回顾内容。你随时可以重新邀请。' : '取消后，这条邀请将失效，你可以稍后重新发起。'}</p><div><button type="button" onClick={()=>setConfirmOpen(false)}>再想想</button><button type="button" className="is-danger" onClick={revoke}>确认取消</button></div></div></> : null}
    </section>
  );
}

window.REVIEW_SHARE_MODULES = REVIEW_SHARE_MODULES;
window.ReviewShareFlow = ReviewShareFlow;
