import React, { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { money, receiptDate } from './format';
import Icon from './Icon';
export default function ReceiptHistory({ refresh, onOpen, onError }) {
  const generation = useRef(0);
  const [query, setQuery] = useState(''); const [rows, setRows] = useState([]); const [cursor, setCursor] = useState(null); const [busy, setBusy] = useState(true); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
  useEffect(() => { generation.current += 1; let active = true; setBusy(true); setError(''); const timer = setTimeout(() => api.history(query).then(result => { if (active) { setRows(result.receipts); setCursor(result.nextCursor); } }).catch(problem => { if (active) { setError(problem.message); onError(problem); } }).finally(() => { if (active) setBusy(false); }), query ? 250 : 0); return () => { generation.current += 1; active = false; clearTimeout(timer); }; }, [query, refresh, retry, onError]);
  async function more() { if (busy) return; const request = generation.current; setBusy(true); try { const result = await api.history(query, cursor); if (request !== generation.current) return; setRows(current => [...current, ...result.receipts]); setCursor(result.nextCursor); } catch (problem) { if (request === generation.current) { setError(problem.message); onError(problem); } } finally { if (request === generation.current) setBusy(false); } }
  return <section><label className="search-field"><Icon name="search" /><span className="sr-only">Search receipts</span><input type="search" maxLength={80} placeholder="Search number, service, or customer" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div className="list-heading"><span>Receipt history</span><span>Newest first</span></div>
    {error ? <div className="notice error" role="alert"><p>{error}</p><button className="secondary" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : busy && !rows.length ? <div className="loading-lines" role="status">Loading receipts…</div> : !rows.length ? <div className="empty-state"><Icon name="receipt" /><h2>{query ? 'No matching receipts' : 'Your receipts will live here'}</h2><p>{query ? 'Try another service, customer name, or receipt number.' : 'Create your first receipt to keep a searchable copy and its PDF.'}</p></div> : <div className="receipt-list">{rows.map(receipt => <button className="receipt-row" key={receipt.id} onClick={() => onOpen(receipt.id)}><span className="receipt-row-copy"><strong>{receipt.items.map(item => item.description).join(' · ')}</strong><span>{receiptDate(receipt.createdAt)}{receipt.customer?.name ? ` · ${receipt.customer.name}` : ''}</span><small>{receipt.number} · v{receipt.revision}</small></span><span className="receipt-row-total">{money(receipt.totalCents)}<Icon name="arrow" /></span></button>)}</div>}
    {cursor && <button className="secondary load-more" disabled={busy} onClick={more}>{busy ? 'Loading…' : 'Load more receipts'}</button>}
    <p className="section-note">Receipts are individual records, not a measure of the shop’s total sales.</p>
  </section>;
}
