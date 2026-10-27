import test from 'node:test';
import assert from 'node:assert/strict';
import { getPeriods, buildOverview, normalizeSnapshot } from '../src/admin/analytics.mjs';
import { loadOverview } from '../src/admin/overviewSource.mjs';
const now = new Date('2026-10-26T15:00:00Z');
const snapshot = rows => normalizeSnapshot({ status: 'connected', lastSuccessfulAt: now.toISOString(), rows });
const full = (range = '7d', comparison = 'previous', date = now) => {
  const p = getPeriods(range, comparison, date);
  return snapshot([...new Set([...p.dates, ...p.comparisonDates].filter(Boolean))].map(d => ({ date:d, views:10, calls:0, directions:2, website:1 })));
};
test('production source is explicitly pending and contains no example metrics', async () => {
  const data=await loadOverview(); assert.equal(data.status,'pending'); assert.deepEqual(data.rows,[]); assert.equal(data.lastSuccessfulAt,null);
});
test('daily ranges end on yesterday in Chicago, including before local midnight', () => {
  const p=getPeriods('7d','previous',new Date('2026-10-26T02:00:00Z'));
  assert.deepEqual(p.current,{start:'2026-10-18',end:'2026-10-24'});
  assert.deepEqual(p.previous,{start:'2026-10-11',end:'2026-10-17'}); assert.equal(p.dates.length,7);
  assert.equal(getPeriods('30d','previous',now).dates.length,30);
  assert.equal(getPeriods('90d','previous',now).dates.length,90);
});
test('12 months uses complete calendar months and a prior calendar year', () => {
  const p=getPeriods('12m','previous',new Date('2024-03-31T15:00:00Z'));
  assert.deepEqual(p.current,{start:'2023-03-01',end:'2024-02-29'});
  assert.deepEqual(p.previous,{start:'2022-03-01',end:'2023-02-28'});
  assert.equal(p.dates.length,366); assert.equal(p.comparisonDates.filter(Boolean).length,365);
});
test('year comparisons never map leap day onto the wrong calendar day', () => {
  const p=getPeriods('7d','year',new Date('2024-03-02T16:00:00Z'));
  assert.equal(p.comparisonDates[p.dates.indexOf('2024-02-29')],null);
  assert.equal(p.comparisonDates[p.dates.indexOf('2024-03-01')],'2023-03-01');
});
test('complete genuine zero is a total; missing is unavailable; partial totals have no growth', () => {
  const data=full(); let view=buildOverview(data,'7d','previous',now);
  assert.equal(view.metrics.calls.total,0); assert.equal(view.metrics.views.percent,0); assert.equal(view.metrics.calls.percent,null);
  assert.equal(view.metrics.calls.reason,'zero-baseline');
  data.rows=data.rows.filter(r=>r.date!=='2026-10-25'); view=buildOverview(data,'7d','previous',now);
  assert.equal(view.metrics.views.total,60); assert.equal(view.metrics.views.count,6); assert.equal(view.metrics.views.complete,false); assert.equal(view.metrics.views.percent,null);
  const empty=buildOverview(snapshot([]),'7d','previous',now);
  assert.equal(empty.metrics.views.total,null); assert.equal(empty.rows.at(-1).views,null);
});
test('stale, delayed and error snapshots suppress growth without losing cached values', () => {
  for(const override of [{lastSuccessfulAt:'2026-10-20T10:00:00Z'},{status:'delayed'},{status:'error'},{lastSuccessfulAt:null}]) {
    const data={...full(),...override}; const view=buildOverview(data,'7d','previous',now);
    assert.equal(view.stale,true); assert.equal(view.metrics.views.total,70); assert.equal(view.metrics.views.percent,null);
  }
  const data=full(); data.rows=data.rows.filter(r=>r.date<'2026-10-22');
  assert.equal(buildOverview(data,'7d','previous',now).stale,true);
});
test('invalid values remain missing, duplicate dates reject, and unsafe totals never render', () => {
  const s=snapshot([{date:'2026-10-25',views:-1,calls:'12',directions:Infinity,website:0}]);
  assert.deepEqual(s.rows[0],{date:'2026-10-25',views:null,calls:null,directions:null,website:0});
  assert.throws(()=>snapshot([{date:'2026-02-30' }]));
  assert.throws(()=>snapshot([{date:'2026-10-25'},{date:'2026-10-25'}]));
  assert.throws(()=>normalizeSnapshot({status:'connected',rows:null}));
  const data=full();data.rows.forEach(r=>r.views=Number.MAX_SAFE_INTEGER);
  assert.equal(buildOverview(data,'7d','previous',now).metrics.views.total,null);
});
test('year-over-year availability is specific to the selected metric history', () => {
  const data=full();data.rows.push({date:'2025-10-25',views:4,calls:null,directions:null,website:null});
  const view=buildOverview(data,'7d','previous',now);
  assert.equal(view.yearAvailable.views,true);assert.equal(view.yearAvailable.calls,false);
});
test('monthly aggregation leaves incomplete buckets missing and unequal leap totals un-compared', () => {
  const date=new Date('2024-03-31T15:00:00Z'); const data=full('12m','previous',date);data.lastSuccessfulAt=date.toISOString();
  data.rows.push({date:'2024-03-30',views:10,calls:0,directions:2,website:1});
  const view=buildOverview(data,'12m','previous',date);
  assert.equal(view.rows.length,12);assert.equal(view.rows.at(-1).views,290);assert.equal(view.rows.at(-1).previous.views,280);
  assert.equal(view.metrics.views.percent,null);assert.equal(view.metrics.views.reason,'unequal-period');
  data.rows=data.rows.filter(r=>r.date!=='2024-02-10');
  assert.equal(buildOverview(data,'12m','previous',date).rows.at(-1).views,null);
});
test('a recent successful retrieval of old monthly data cannot imply current coverage',()=>{
  const data=full('12m','previous',now);
  const view=buildOverview(data,'12m','previous',now);
  assert.equal(view.stale,true);assert.equal(view.metrics.views.percent,null);assert.equal(view.metrics.views.reason,'stale');
});
