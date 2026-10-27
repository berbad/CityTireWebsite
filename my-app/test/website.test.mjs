import test,{before,after,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';
import React from 'react';
import {getPeriods,buildOverview} from '../src/admin/analytics.mjs';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://www.citytireshop.com/admin'});
for(const k of ['window','document','HTMLElement','Node','MutationObserver'])globalThis[k]=dom.window[k];Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let render,fireEvent,waitFor,cleanup,act,server,source,publicAnalytics,AnalyticsOverview,WebsiteConnection;
before(async()=>{({render,fireEvent,waitFor,cleanup,act}=await import('@testing-library/react'));server=await createServer({server:{middlewareMode:true,hmr:false,ws:false}});try{source=await server.ssrLoadModule('/src/admin/websiteSource.mjs');publicAnalytics=await server.ssrLoadModule('/src/publicAnalytics.mjs');AnalyticsOverview=(await server.ssrLoadModule('/src/admin/AnalyticsOverview.jsx')).default;WebsiteConnection=(await server.ssrLoadModule('/src/admin/WebsiteConnection.jsx')).default;}catch{}});
afterEach(()=>cleanup());after(async()=>{await server?.close();dom.window.close();});
const now=new Date('2026-10-26T02:00:00Z');
const snapshot=(status='connected')=>({status,timeZone:'UTC',coverageStart:'2026-10-24',lastSuccessfulAt:now.toISOString(),lastAttemptAt:now.toISOString(),tokenExpiresAt:'2027-01-01T00:00:00Z',rows:[{date:'2026-10-24',pageviews:0},{date:'2026-10-25',pageviews:13}]});
test('website periods use UTC while default Google periods remain Chicago',()=>{
 assert.equal(getPeriods('7d','previous',now,'UTC').current.end,'2026-10-25');assert.equal(getPeriods('7d','previous',now).current.end,'2026-10-24');
 assert.deepEqual(getPeriods('12m','previous',new Date('2024-03-01T01:00:00Z'),'UTC').current,{start:'2023-03-01',end:'2024-02-29'});
});
test('website normalization rejects invalid source metadata and computes pageviews without Google aliasing',()=>{
 assert.equal(typeof source?.normalizeWebsiteSnapshot,'function');const data=source.normalizeWebsiteSnapshot(snapshot());const view=buildOverview(data,'7d','previous',now,{metrics:source.WEBSITE_METRICS,timeZone:'UTC'});
 assert.equal(view.metrics.pageviews.total,13);assert.equal(view.metrics.pageviews.count,2);assert.equal(view.metrics.pageviews.percent,null);assert.equal(view.rows.at(-1).pageviews,13);assert.equal(view.metrics.views,undefined);
 for(const raw of [{...snapshot(),timeZone:'America/Chicago'},{...snapshot(),coverageStart:'2026-02-30'},{...snapshot(),rows:[{date:'2026-10-25',pageviews:-1}]}])assert.throws(()=>source.normalizeWebsiteSnapshot(raw));
});
test('collection excludes private paths and strips query/hash from allowed page views',()=>{
 assert.equal(typeof publicAnalytics?.beforeSendPublic,'function');
 for(const path of ['/admin','/admin/receipts','/login','/recover#token=private','/register','/unknown'])assert.equal(publicAnalytics.beforeSendPublic({type:'pageview',url:`https://www.citytireshop.com${path}`}),null);
 const event=publicAnalytics.beforeSendPublic({type:'pageview',url:'https://www.citytireshop.com/services/?email=private#secret'});assert.equal(event.url,'https://www.citytireshop.com/services/');
 assert.equal(publicAnalytics.beforeSendPublic({type:'event',url:'https://www.citytireshop.com/'}),null);
});
test('website selector shows pageviews with UTC and source switches never relabel Google data',async()=>{
 assert.equal(typeof AnalyticsOverview,'function');const v=render(React.createElement(AnalyticsOverview,{now,websiteLoad:async()=>snapshot()}));await v.findByText('Google approval pending');fireEvent.click(v.getByRole('button',{name:'Website',exact:true}));await v.findByRole('button',{name:/Website page views 13/});assert.ok(v.getByText(/Complete days · UTC/));assert.equal(v.queryByRole('button',{name:/Profile views/}),null);assert.ok(v.getByText(/not distinct people/));
 fireEvent.click(v.getByRole('button',{name:'Google profile'}));await v.findByText('Google approval pending');assert.equal(v.queryByRole('button',{name:/Website page views 13/}),null);
});
test('waiting website is distinct from Google approval and settings show safe connection details',async()=>{
 const data={...snapshot('waiting'),rows:[],lastSuccessfulAt:null};const v=render(React.createElement(AnalyticsOverview,{now,websiteLoad:async()=>data}));fireEvent.click(v.getByRole('button',{name:'Website',exact:true}));await v.findByText('Waiting for first full day');assert.equal(v.queryByText('Google approval pending'),null);assert.equal(v.queryByRole('slider'),null);v.unmount();
 const settings=render(React.createElement(WebsiteConnection,{load:async()=>snapshot('not_connected')}));await settings.findByText('Reconnect needed');assert.ok(settings.getByText(/Jan 1, 2027/));assert.ok(settings.getByText(/Daily at 08:00 UTC/));
});
test('website cache survives failed refresh, expired session reaches shell, and late response cannot cross sources',async()=>{
 let fail=false;let notified;const load=async()=>{if(fail)throw Object.assign(new Error('expired'),{status:401});return snapshot();};const v=render(React.createElement(AnalyticsOverview,{now,websiteLoad:load,onError:e=>notified=e}));fireEvent.click(v.getByRole('button',{name:'Website',exact:true}));await v.findByRole('button',{name:/Website page views 13/});fail=true;fireEvent.click(v.getByRole('button',{name:'Refresh data'}));await v.findByRole('alert');assert.equal(notified.status,401);assert.ok(v.getByRole('button',{name:/Website page views 13/}));assert.ok(v.getByText(/Comparison paused/));v.unmount();
 let resolve;const waiting=render(React.createElement(AnalyticsOverview,{now,websiteLoad:()=>new Promise(r=>resolve=r)}));fireEvent.click(waiting.getByRole('button',{name:'Website',exact:true}));await waitFor(()=>assert.equal(typeof resolve,'function'));fireEvent.click(waiting.getByRole('button',{name:'Google profile'}));await act(async()=>resolve(snapshot()));assert.ok(waiting.getByText('Google approval pending'));assert.equal(waiting.queryByRole('button',{name:/Website page views 13/}),null);
});
test('website comparison values disappear after failure or incomplete coverage while current values remain',async()=>{
 const complete={...snapshot(),coverageStart:'2026-10-12',rows:Array.from({length:14},(_,i)=>({date:`2026-10-${String(i+12).padStart(2,'0')}`,pageviews:i<7?11:4}))};
 let mode='ok';const load=async()=>{if(mode==='fail')throw Error('offline');if(mode==='partial')return {...complete,rows:complete.rows.filter(r=>r.date!=='2026-10-20')};return complete;};
 const v=render(React.createElement(AnalyticsOverview,{now,websiteLoad:load}));fireEvent.click(v.getByRole('button',{name:'Website',exact:true}));await v.findByRole('slider');fireEvent.click(v.getByRole('button',{name:'7 days'}));assert.ok(v.getByText('Selected: 28 · Comparison: 77'));assert.ok(v.getByRole('columnheader',{name:'Previous period'}));
 for(const next of ['fail','partial']){mode=next;fireEvent.click(v.getByRole('button',{name:'Refresh data'}));await waitFor(()=>assert.equal(v.getByRole('button',{name:'Refresh data'}).disabled,false));assert.equal(Boolean(v.queryByRole('columnheader',{name:'Previous period'})),false);assert.equal(Boolean(v.queryByText(/Selected:.*Comparison:/)),false);assert.equal(Boolean(v.container.querySelector('.chart-previous')),false);assert.ok(v.getByRole('button',{name:next==='fail'?/Website page views 28/:/Website page views 24/}));}
});
