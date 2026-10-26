import React, { useRef, useState } from 'react';
import Dialog from './Dialog';
import Icon from './Icon';
import { api } from './api';
import { cents, money } from './format';
export default function ReceiptSheet({ draft, setDraft, onClose, onSaved, onSessionExpired, exportPdf }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [exported, setExported] = useState(null); const guard = useRef(false);
  const frozen = busy || Boolean(draft.pending) || Boolean(draft.saved);
  const total = draft.items.reduce((sum, item) => sum + (cents(item.unitPrice) || 0) * (Number(item.quantity) || 0), 0);
  const update = change => setDraft(current => ({ ...current, ...change, dirty: true }));
  function itemChange(index, field, value) { update({ items: draft.items.map((item, n) => n === index ? { ...item, [field]: value } : item) }); }
  function popup() { const tab = window.open('about:blank', '_blank'); if (tab) { tab.opener = null; tab.document.title = 'Preparing receipt'; tab.document.body.textContent = 'Preparing your receipt…'; } return tab; }
  async function openPdf(receipt, tab) { const result = await exportPdf(receipt, tab); setExported(result); }
  async function submit(event) {
    event.preventDefault(); if (guard.current) return;
    let payload = draft.pending;
    if (!payload) {
      if (draft.items.some(item => !item.description.trim() || cents(item.unitPrice) === null || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 999)) { setError('Add a service, a whole-number quantity, and a valid price for every item.'); return; }
      payload = { requestId: crypto.randomUUID(), items: draft.items.map(item => ({ ...item, quantity: Number(item.quantity) })), customer: draft.customer, ...(draft.receiptId ? { expectedRevision: draft.expectedRevision } : {}) };
      setDraft(current => ({ ...current, pending: payload }));
    }
    guard.current = true; setBusy(true); setError(''); const tab = popup(); let saved;
    try {
      saved = await api.save(payload, draft.receiptId);
      setDraft(current => ({ ...current, pending: null, saved, dirty: false })); onSaved(saved);
      await openPdf(saved, tab);
    } catch (problem) {
      tab?.close();
      if (problem.status === 401) onSessionExpired();
      if (!saved && problem.status >= 400 && problem.status < 500 && problem.status !== 401 && problem.status !== 429) setDraft(current => ({ ...current, pending: null }));
      setError(saved ? 'Receipt saved. The PDF could not open. Retry the PDF below.' : problem.message);
    } finally { guard.current = false; setBusy(false); }
  }
  async function retryPdf() { if (guard.current) return; guard.current = true; setBusy(true); setError(''); const tab = popup(); try { await openPdf(draft.saved, tab); } catch (problem) { tab?.close(); if (problem.status === 401) onSessionExpired(); setError('Receipt saved. The PDF is still unavailable. Please try again.'); } finally { guard.current = false; setBusy(false); } }
  function close() { if (busy) return; if ((draft.dirty || draft.pending) && !draft.saved && !window.confirm(draft.pending ? 'The save result is uncertain. Closing could leave a saved receipt in history. Close and check history?' : 'Discard this unsaved receipt?')) return; onClose(); }
  return <Dialog title={draft.receiptId ? 'Correct receipt' : 'New receipt'} onClose={close} busy={busy}>
    {draft.saved ? <div className="receipt-saved"><span className="success-icon"><Icon name="check" /></span><h3>Receipt saved</h3><p className="receipt-number">{draft.saved.number} · v{draft.saved.revision}</p><p className="saved-total">{money(draft.saved.totalCents)}</p>{error && <p role="alert" className="notice error">{error}</p>}{exported ? <><a className="primary" href={exported.url} target="_blank" rel="noreferrer">Open PDF</a>{exported.share && <button className="secondary" onClick={exported.share}><Icon name="share" />Share PDF</button>}</> : <button className="primary" onClick={retryPdf} disabled={busy}>{busy ? 'Preparing PDF…' : 'Retry PDF'}</button>}<button className="secondary" onClick={close} disabled={busy}>Done</button></div> : <form onSubmit={submit} className="receipt-form">
      <p className="muted compact">{draft.receiptId ? 'This saves a new revision. Earlier receipts and PDFs stay available.' : 'Receipt number and date are added when you save.'}</p>
      <fieldset disabled={frozen}><legend className="sr-only">Receipt items</legend><div className="service-items">{draft.items.map((item, index) => <section className="service-item" key={index}>
        <div className="item-heading"><h3>Item {index + 1}</h3>{draft.items.length > 1 && <button type="button" className="text-button" onClick={() => update({ items: draft.items.filter((_, n) => n !== index) })}>Remove<span className="sr-only"> item {index + 1}</span></button>}</div>
        <label htmlFor={`description-${index}`}>Service description<span className="sr-only"> {index + 1}</span></label><textarea id={`description-${index}`} rows={2} required maxLength={500} placeholder="e.g. Flat tire repair" value={item.description} onChange={e => itemChange(index, 'description', e.target.value)} />
        <div className="price-row"><label>Quantity<span className="sr-only"> {index + 1}</span><input inputMode="numeric" pattern="[0-9]+" required value={item.quantity} onChange={e => itemChange(index, 'quantity', e.target.value)} /></label><label>Unit price<span className="sr-only"> {index + 1}</span><span className="money-input"><span aria-hidden="true">$</span><input aria-label={`Unit price ${index + 1}`} inputMode="decimal" required placeholder="0.00" value={item.unitPrice} onChange={e => itemChange(index, 'unitPrice', e.target.value)} /></span></label></div>
      </section>)}</div><button type="button" className="secondary add-item" onClick={() => update({ items: [...draft.items, { description: '', quantity: '1', unitPrice: '' }] })} disabled={draft.items.length >= 30}><Icon name="plus" />Add Item</button>
        <button type="button" className="text-button customer-toggle" aria-expanded={draft.customerOpen} onClick={() => update({ customerOpen: !draft.customerOpen })}>{draft.customerOpen ? 'Hide customer details' : 'Add customer details (optional)'}</button>
        {draft.customerOpen && <div className="customer-fields"><label>Customer name<input maxLength={120} autoComplete="off" value={draft.customer.name} onChange={e => update({ customer: { ...draft.customer, name: e.target.value } })} /></label><label>Customer phone<input type="tel" maxLength={40} autoComplete="off" value={draft.customer.phone} onChange={e => update({ customer: { ...draft.customer, phone: e.target.value } })} /></label></div>}
      </fieldset>
      {error && <p className="notice error" role="alert">{error}</p>}{draft.pending && !busy && <p className="muted compact">Your previous save may have reached the shop. Retry with the same details to avoid a duplicate.</p>}
      <div className="receipt-actions"><div className="total-row"><span>Total</span><strong aria-live="polite">{money(total)}</strong></div><button className="primary" disabled={busy}>{busy ? 'Saving receipt…' : draft.pending ? 'Retry save' : 'Save & Open PDF'}</button></div>
    </form>}
  </Dialog>;
}
