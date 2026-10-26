import React, { useEffect, useState } from 'react';
import { api } from './api';
import './admin.css';
export default function Recovery() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { window.history.replaceState({}, '', window.location.pathname); }, []);
  async function submit(event) { event.preventDefault(); if (busy) return; if (password !== confirmation) { setError('The passwords do not match.'); return; } setBusy(true); setError(''); try { await api.recover(token, password); setPassword(''); setConfirmation(''); setDone(true); } catch (problem) { setError(problem.message); } finally { setBusy(false); } }
  return <div className="admin-root"><main className="admin-login"><section className="login-panel"><h1>Set your password</h1>{done ? <><p>Your password is saved.</p><a className="primary" href="/login">Sign in</a></> : /^[a-f0-9]{64}$/.test(token) ? <form onSubmit={submit}><p className="muted">Use at least 12 characters for your private shop account.</p><label>New password<input type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} /></label><label>Confirm password<input type="password" autoComplete="new-password" required minLength={12} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>{error && <p role="alert" className="notice error">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button></form> : <p className="notice">Open your recovery link to set a password. Recovery links expire after 30 minutes.</p>}</section></main></div>;
}
