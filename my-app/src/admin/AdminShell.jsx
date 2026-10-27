import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from './api';
import { newDraft } from './format';
import Icon from './Icon';
import Dialog from './Dialog';
import LoginPanel from './LoginPanel';
import ReceiptSheet from './ReceiptSheet';
import ReceiptHistory from './ReceiptHistory';
import ReceiptDetail from './ReceiptDetail';
import Overview from './Overview';
import './admin.css';
const sections = ['Overview', 'Receipts', 'Competitors', 'Marketing', 'Settings'];
export default function AdminShell() {
  const navigate = useNavigate(); const location = useLocation(); const active = location.pathname.split('/')[2] || 'overview';
  const [session, setSession] = useState(undefined); const [error, setError] = useState(''); const [menu, setMenu] = useState(false); const [draft, setDraft] = useState(null); const [selected, setSelected] = useState(null); const [refresh, setRefresh] = useState(0); const [checking, setChecking] = useState(0); const [loggingOut, setLoggingOut] = useState(false); const urls = useRef(new Set());
  const onError = useCallback(problem => { if (problem.status === 401) { setSession(null); setMenu(false); } }, []);
  useEffect(() => { let active = true; api.session().then(result => { if (active) { setSession(result); setError(''); } }).catch(problem => { if (active) { if (problem.status === 401) setSession(null); else setError(problem.message); } }); return () => { active = false; }; }, [checking]);
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  async function exportPdf(receipt, tab) {
    const blob = await api.pdf(receipt.id, receipt.revision); const url = URL.createObjectURL(blob); urls.current.add(url);
    if (tab && !tab.closed) tab.location.replace(url);
    const file = new File([blob], `${receipt.number}-v${receipt.revision}.pdf`, { type: 'application/pdf' });
    return { url, share: navigator.canShare?.({ files: [file] }) ? async () => { try { await navigator.share({ files: [file], title: 'City Tire receipt' }); } catch (problem) { if (problem.name !== 'AbortError') setError('Sharing could not open. Use Open PDF to download or share.'); } } : null };
  }
  function changeSection(section) { navigate(section === 'Overview' ? '/admin' : `/admin/${section.toLowerCase()}`); setSelected(null); setMenu(false); setError(''); }
  async function logout() { if (loggingOut) return; if (draft?.dirty && !window.confirm('Discard the unsaved receipt and sign out?')) return; setLoggingOut(true); try { await api.logout(); setSession(null); setDraft(null); setSelected(null); urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current.clear(); navigate('/login'); } catch (problem) { setError(problem.message); onError(problem); } finally { setLoggingOut(false); } }
  if (session === undefined) return <div className="admin-root"><main className="admin-loading"><span className="brand-mark">CT</span>{error ? <><p role="alert">{error}</p><button className="secondary" onClick={() => setChecking(n => n + 1)}>Try again</button></> : <p role="status">Checking your access…</p>}</main></div>;
  if (session === null) return <div className="admin-root"><LoginPanel expired={Boolean(draft)} onSuccess={result => { setSession(result); setError(''); if (location.pathname === '/login') navigate('/admin', { replace: true }); }} /></div>;
  const title = sections.find(section => section.toLowerCase() === active) || 'Overview';
  return <div className="admin-root"><header className="admin-header"><a className="admin-brand" href="/admin" onClick={event => { event.preventDefault(); changeSection('Overview'); }}><span className="brand-mark" aria-hidden="true">CT</span><span>City Tire<span className="brand-sub">Repair Shop</span></span></a><button className="icon-button" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" /></button></header>
    <main className="admin-content"><div className="page-heading"><div><h1>{title}</h1><p className="muted">{active === 'receipts' ? 'A clear record of every receipt.' : active === 'overview' ? 'See how people discover your shop.' : 'City Tire Repair Shop'}</p></div><button className="primary new-receipt" onClick={() => setDraft(newDraft())}><Icon name="plus" />New Receipt</button></div>
      {error && <p className="notice error" role="alert">{error}</p>}
      {active === 'receipts' ? selected ? <ReceiptDetail id={selected} refresh={refresh} onBack={() => setSelected(null)} onEdit={receipt => setDraft(newDraft(receipt))} onError={onError} exportPdf={exportPdf} /> : <ReceiptHistory refresh={refresh} onOpen={setSelected} onError={onError} /> : active === 'settings' ? <section className="settings-panel"><h2>Your account</h2><p className="account-email">{session.user.email}</p><p className="muted">You’ll be signed out after 30 minutes without a request, or after 12 hours. Unsaved receipt details stay in this tab if you need to sign in again.</p><button className="secondary" onClick={logout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button><div className="google-settings"><h2>Google Business Profile</h2><p>Approval pending. Google is reviewing your access request; performance data is not connected yet.</p><p className="muted">Request submitted October 26, 2026</p></div></section> : active === 'competitors' ? <section className="empty-state"><Icon name="competitors" /><h2>A closer look at your neighborhood</h2><p>No competitors are being tracked yet. You’ll choose which suggested businesses to follow when competitor discovery is connected.</p></section> : active === 'marketing' ? <section className="empty-state"><Icon name="marketing" /><h2>No Google Ads account connected</h2><p>When connected, you’ll see advertising performance here. Campaigns and spending will always stay under your control in Google Ads.</p></section> : <>
        <Overview onError={onError} />
        <section className="receipt-shortcut"><Icon name="receipt" /><div><h2>Receipts, kept together.</h2><p className="muted">Find a saved receipt, make a correction, or reopen its PDF.</p></div><button className="secondary" onClick={() => changeSection('Receipts')}>View receipts<Icon name="arrow" /></button></section>
      </>}
    </main>
    {menu && <Dialog title="Your shop" navigation onClose={() => setMenu(false)}><nav aria-label="Admin navigation">{sections.map(section => <button key={section} aria-current={title === section ? 'page' : undefined} onClick={() => changeSection(section)}><Icon name={section.toLowerCase()} />{section}<Icon name="arrow" /></button>)}</nav><div className="menu-footer"><a href="/">Visit shop website</a><button className="secondary" onClick={logout} disabled={loggingOut}>Sign out</button></div></Dialog>}
    {draft && <ReceiptSheet draft={draft} setDraft={setDraft} onClose={() => setDraft(null)} onSaved={() => setRefresh(n => n + 1)} onSessionExpired={() => setSession(null)} exportPdf={exportPdf} />}
  </div>;
}
