import React, { useEffect, useState } from 'react';
import { formatDate } from './analytics.mjs';
import { loadWebsite, normalizeWebsiteSnapshot, websiteStatus } from './websiteSource.mjs';
const noop = () => {};
export default function WebsiteConnection({ load = loadWebsite, onError = noop }) {
  const [data, setData] = useState(null), [error, setError] = useState('');
  useEffect(() => { let active = true; Promise.resolve().then(load).then(normalizeWebsiteSnapshot).then(next => { if (active) setData(next); }).catch(problem => { if (active) { setError('Website connection status could not be loaded.'); onError(problem); } }); return () => { active = false; }; }, [load, onError]);
  return <div className="google-settings"><h2>Website analytics</h2>{error ? <p role="alert">{error}</p> : <><p>{websiteStatus(data)}</p><p className="muted">Daily at 08:00 UTC · Public website page views only</p>{data?.coverageStart && <p className="muted">History begins {formatDate(data.coverageStart)} (UTC).</p>}<p className="muted">Last successful update: {data?.lastSuccessfulAt ? new Date(data.lastSuccessfulAt).toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ' Chicago time' : 'No successful update yet'}</p>{data?.tokenExpiresAt && <p className="muted">Connection credential expires {formatDate(data.tokenExpiresAt.slice(0,10))} (UTC).</p>}</>}</div>;
}
