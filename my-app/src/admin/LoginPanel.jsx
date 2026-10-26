import React, { useState } from 'react';
import { api } from './api';
export default function LoginPanel({ onSuccess, expired = false }) {
  const [email, setEmail] = useState('citytirerepairshop5112@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { const result = await api.login(email, password); setPassword(''); onSuccess(result); } catch (problem) { setError(problem.message); } finally { setBusy(false); }
  }
  return <main className="admin-login"><a href="/" className="admin-brand"><span className="brand-mark" aria-hidden="true">CT</span><span>City Tire<span className="brand-sub">Repair Shop</span></span></a><section className="login-panel">
    <h1>Welcome back.</h1><p className="muted">{expired ? 'Sign in again to continue. Your receipt details are still here.' : 'Your shop, all in one place.'}</p>
    <form onSubmit={submit}><label>Email<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
      {error && <p className="notice error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form><p className="login-note">Private access for City Tire Repair Shop.</p>
  </section><a className="text-link" href="/">Back to the shop website</a></main>;
}
