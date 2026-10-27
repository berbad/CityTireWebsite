import React, { useEffect, useMemo, useState } from 'react';
import { METRICS, RANGES, buildOverview, normalizeSnapshot, formatPeriod } from './analytics.mjs';
import { loadOverview } from './overviewSource.mjs';
import { WEBSITE_METRICS, WEBSITE_OPTIONS, normalizeWebsiteSnapshot, websiteStatus } from './websiteSource.mjs';
import TrendChart from './TrendChart';
import './overview.css';
const noop=()=>{};
const empty={status:'not_connected',lastSuccessfulAt:null,rows:[]};
const count=n=>n===null?'—':n.toLocaleString('en-US');
function comparisonText(stat) {
  if(stat.reason==='stale')return 'Comparison paused while data is delayed or out of date.';
  if(stat.reason==='incomplete')return 'Comparison needs complete data for both periods.';
  if(stat.reason==='unequal-period')return 'These calendar periods have different day counts. No percentage comparison is shown.';
  if(stat.reason==='zero-baseline')return `The comparison period recorded zero. A percentage change cannot be calculated.`;
  const n=stat.percent;return n===0?'No change from the comparison period.':`${Math.abs(n).toLocaleString('en-US',{maximumFractionDigits:1})}% ${n>0?'more':'fewer'} than the comparison period.`;
}
export default function Overview({load=loadOverview,onError=noop,now,source='google'}) {
  const website=source==='website',definitions=website?WEBSITE_METRICS:METRICS,options=website?WEBSITE_OPTIONS:undefined,sourceName=website?'website':'Google';
  const [snapshot,setSnapshot]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
  const [range,setRange]=useState('30d'),[metric,setMetric]=useState(website?'pageviews':'views'),[comparison,setComparison]=useState('previous');
  const [clock,setClock]=useState(()=>new Date());
  useEffect(()=>{if(now)return;const timer=setInterval(()=>setClock(new Date()),60000);return()=>clearInterval(timer);},[now]);
  useEffect(()=>{
    let active=true;setLoading(true);
    Promise.resolve().then(load).then(website?normalizeWebsiteSnapshot:normalizeSnapshot).then(next=>{if(!active)return;if(next.status==='error')throw new Error('Data update failed.');setSnapshot(previous=>next.status==='delayed'&&!next.rows.length&&previous?.rows.length?{...previous,status:next.status}:next);setError('');}).catch(problem=>{if(!active)return;setError(`Could not update ${sourceName} data. Your last retrieved values are still shown, if available. Try again.`);onError(problem);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[load,refresh,onError,website,sourceName]);
  const data=useMemo(()=>error?{...(snapshot||empty),status:'error'}:snapshot||empty,[snapshot,error]);
  const date=now||clock;
  const baseline=useMemo(()=>buildOverview(data,range,'previous',date,options),[data,range,date,options]);
  const effectiveComparison=comparison==='year'&&baseline.yearAvailable[metric]?'year':'previous';
  const view=useMemo(()=>effectiveComparison==='previous'?baseline:buildOverview(data,range,'year',date,options),[data,range,effectiveComparison,date,baseline,options]);
  const selected=definitions.find(m=>m.key===metric),stat=view.metrics[metric];
  const showComparison=!website||(!view.stale&&stat.complete&&stat.previous.complete);
  const chartRows=showComparison?view.rows:view.rows.map(row=>({...row,previous:Object.fromEntries(definitions.map(m=>[m.key,null]))}));
  const pending=data.status==='pending';const comparisonLabel=effectiveComparison==='year'?'Year over year':'Previous period';
  const status=website?(error?'Update unavailable':view.stale&&data.status==='connected'?'Data delayed':websiteStatus(snapshot)):loading&&!snapshot?'Loading Google status…':error?'Update unavailable':pending?'Google approval pending':data.status==='not_connected'?'Google not connected':view.stale?'Data delayed':data.status==='error'?'Update unavailable':data.status==='delayed'?'Data delayed':'Google connected';
  return <section className="analytics-overview" aria-label={website?'Website performance':'Google performance'}>
    <div className="overview-heading"><div><h2>{website?'Website performance':'Google performance'}</h2><p>{website?'Activity on your public shop website.':'How people find your shop on Search and Maps.'}</p></div><span className="status-badge">{status}</span></div>
    {!website&&pending&&<p className="connection-note">Your access request is under review. Performance will appear here after approval and connection.</p>}
    {website&&<p className="connection-note">Updates daily at 08:00 UTC. {data.coverageStart?`Reliable history begins ${data.coverageStart}.`:'Connect the website source to begin collecting reliable history.'} Earlier periods stay blank.</p>}
    {error&&<p className="notice error" role="alert">{error}</p>}
    {view.stale&&!error&&<p className="notice">Showing the last retrieved data. Updates are delayed; comparisons are paused.</p>}
    <div className="overview-controls"><div className="range-control" role="group" aria-label="Reporting range">{RANGES.map(r=><button key={r.key} aria-pressed={range===r.key} onClick={()=>setRange(r.key)}>{r.label}</button>)}</div><label className="comparison-control">Compare with<select value={effectiveComparison} onChange={event=>setComparison(event.target.value)}><option value="previous">Previous period</option>{!website&&<option value="year" disabled={!baseline.yearAvailable[metric]}>{baseline.yearAvailable[metric]?'Year over year':'Year over year — needs history'}</option>}</select></label></div>
    <p className="reporting-period">{formatPeriod(view.current)}<span>{`${range==='12m'?'12 complete calendar months':'Complete days'} · ${website?'UTC':'Chicago time'}`}</span></p>
    <div className={`overview-metrics${website?' website-metrics':''}`} role="group" aria-label="Select a metric">{definitions.map(m=>{const s=view.metrics[m.key];return <button key={m.key} className="metric-card" aria-label={`${m.label} ${s.total===null?'Unavailable':count(s.total)}${!s.complete&&s.total!==null?' Partial':''}`} aria-pressed={metric===m.key} onClick={()=>{setMetric(m.key);if(!baseline.yearAvailable[m.key])setComparison('previous');}}><span className="metric-name">{m.label}</span><strong aria-label={s.total===null?'Unavailable':undefined}>{count(s.total)}</strong><span className="metric-context">{s.total===null?'Awaiting data':!s.complete?`Partial · ${s.count}/${s.expected} days`:s.percent!==null?`${s.percent>0?'+':''}${s.percent.toLocaleString('en-US',{maximumFractionDigits:1})}% vs comparison`:`${s.count} days reported`}</span>{m.key==='website'&&<small>From Google</small>}</button>;})}</div>
    <div className="trend-panel"><div className="trend-heading"><h3>{selected.label}</h3><span>{range==='12m'?'Monthly totals':'Daily totals'}</span></div>
      {loading&&!snapshot?<div className="trend-empty"><p>Loading your data status…</p></div>:<TrendChart key={`${metric}-${range}-${effectiveComparison}-${view.current.end}`} pending={pending} waiting={website&&data.status==='waiting'} rows={chartRows} showComparison={showComparison} metric={selected} comparisonLabel={comparisonLabel}/>}
      <div className="metric-explanation"><p>{selected.explanation}</p><p>{comparisonText(stat)}</p>{stat.total!==null&&<p className="compact muted">Selected: {count(stat.total)}{!stat.complete?' (partial)':''}{showComparison&&<> · Comparison: {count(stat.previous.total)}{!stat.previous.complete&&stat.previous.total!==null?' (partial)':''}</>}</p>}<p className="compact muted">{comparisonLabel}: {formatPeriod(view.previous)}</p></div>
    </div>
    <div className="data-freshness"><div><p>Last successful update: <strong>{data.lastSuccessfulAt?new Date(data.lastSuccessfulAt).toLocaleString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})+' Chicago time':(website?'No successful update yet':'Not yet connected')}</strong></p><p>{website?'Source: Vercel Web Analytics. Refresh reads the saved daily update.':'Source: Google Business Profile. Interactions do not confirm paying customers.'}</p></div>{(website||error||(!pending&&data.status!=='not_connected'&&snapshot))&&<button className="secondary" disabled={loading} onClick={()=>setRefresh(n=>n+1)}>{loading?'Updating…':'Refresh data'}</button>}</div>
  </section>;
}
