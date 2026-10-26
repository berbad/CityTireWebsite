import React, { useEffect, useRef } from 'react';
import Icon from './Icon';
export default function Dialog({ title, onClose, children, navigation = false, busy = false }) {
  const ref = useRef(null);
  useEffect(() => { const previous = document.activeElement; ref.current.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  return <dialog ref={ref} className={`admin-dialog ${navigation ? 'admin-menu' : ''}`} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button type="button" className="icon-button" aria-label={`Close ${navigation ? 'menu' : 'receipt'}`} onClick={onClose} disabled={busy}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}
