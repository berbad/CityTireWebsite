import React, { useState } from 'react';
import Overview from './Overview';
import { loadWebsite } from './websiteSource.mjs';
export default function AnalyticsOverview({ onError, now, websiteLoad = loadWebsite }) {
  const [source, setSource] = useState('google');
  return <><div className="source-control range-control" role="group" aria-label="Analytics source"><button aria-pressed={source === 'google'} onClick={() => setSource('google')}>Google profile</button><button aria-pressed={source === 'website'} onClick={() => setSource('website')}>Website</button></div><Overview key={source} source={source} onError={onError} now={now} {...(source === 'website' ? { load: websiteLoad } : {})} /></>;
}
