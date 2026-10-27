import test,{before,after,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';
import React from 'react';
import {getPeriods} from '../src/admin/analytics.mjs';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/admin'});
for(const key of ['window','document','HTMLElement','Node','MutationObserver'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
dom.window.PointerEvent=dom.window.MouseEvent;
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let render,fireEvent,waitFor,cleanup,act,Overview,server;
const now=new Date('2026-10-26T15:00:00Z');
function connected(){const p=getPeriods('90d','previous',now);return {status:'connected',lastSuccessfulAt:now.toISOString(),rows:[...new Set([...p.dates,...p.comparisonDates])].map(date=>({date,views:10,calls:0,directions:2,website:1}))};}
before(async()=>{({render,fireEvent,waitFor,cleanup,act}=await import('@testing-library/react'));server=await createServer({server:{middlewareMode:true,hmr:false,ws:false}});Overview=(await server.ssrLoadModule('/src/admin/Overview.jsx')).default;});
afterEach(()=>cleanup());after(async()=>{await server?.close();dom.window.close();});
const mount=(props={})=>render(React.createElement(Overview,{now,...props}));
test('pending production state has four selectable metrics, honest blanks and no chart fiction',async()=>{
 const v=mount();await v.findByText('Google approval pending');
 assert.equal(v.getByRole('button',{name:'30 days'}).getAttribute('aria-pressed'),'true');
 for(const label of ['Profile views','Call clicks','Direction requests','Website clicks'])assert.ok(v.getByRole('button',{name:new RegExp(label)}));
 assert.equal(v.queryByRole('slider'),null);assert.ok(v.getByText('No Google data yet'));
 fireEvent.click(v.getByRole('button',{name:/Website clicks/}));assert.ok(v.getByText(/not total website visits/));
 fireEvent.click(v.getByRole('button',{name:'12 months'}));assert.ok(v.getByText(/12 complete calendar months/));
 assert.equal(v.getByRole('option',{name:'Year over year — needs history'}).disabled,true);
});
test('selection, keyboard, range and pointer reveal exact current and comparison values',async()=>{
 const v=mount({load:async()=>connected()});await v.findByRole('slider',{name:'Inspect date'});
 assert.ok(v.getByRole('button',{name:/Profile views 300/}));
 fireEvent.click(v.getByRole('button',{name:'7 days'}));
 const chart=v.getByRole('group',{name:'Profile views trend'});
 fireEvent.keyDown(chart,{key:'Home'});assert.match(v.getByRole('status').textContent,/Oct 19, 2026.*10.*Oct 12, 2026.*10/);
 fireEvent.keyDown(chart,{key:'ArrowRight'});assert.match(v.getByRole('status').textContent,/Oct 20, 2026/);
 const svg=v.getByTestId('trend-plot');svg.getBoundingClientRect=()=>({left:0,width:640,top:0,height:220});
 fireEvent.pointerDown(svg,{clientX:620,pointerId:1});fireEvent.pointerUp(svg,{clientX:620,pointerId:1});
 assert.match(v.getByRole('status').textContent,/Oct 25, 2026/);
 fireEvent.click(v.getByRole('button',{name:/Call clicks/}));assert.ok(v.getByRole('group',{name:'Call clicks trend'}));assert.match(v.getByRole('status').textContent,/0/);
 fireEvent.click(v.getByRole('button',{name:'30 days'}));assert.equal(v.getByRole('slider').max,'29');
});
test('missing days break chart paths and table marks them unavailable, not zero',async()=>{
 const data=connected();data.rows=data.rows.filter(r=>r.date!=='2026-10-22');
 const v=mount({load:async()=>data});await v.findByRole('slider');fireEvent.click(v.getByRole('button',{name:'7 days'}));
 assert.match(v.getByRole('button',{name:/Profile views/}).textContent,/60.*Partial/);
 fireEvent.change(v.getByRole('slider'),{target:{value:'3'}});assert.match(v.getByRole('status').textContent,/Oct 22, 2026.*Unavailable/);
 const line=v.getByTestId('current-line');assert.equal((line.getAttribute('d').match(/M/g)||[]).length,2);
 assert.match(v.getByRole('table').textContent,/Unavailable/);assert.ok(v.getByText(/Comparison needs complete data/));
});
test('failed and malformed refreshes retain cached values and suppress growth',async()=>{
 let mode='ok';const load=async()=>{if(mode==='fail')throw new Error('offline');if(mode==='bad')return {status:'connected',rows:null};return connected();};
 const v=mount({load});await v.findByRole('button',{name:/Profile views 300/});
 for(const next of ['fail','bad']){mode=next;fireEvent.click(v.getByRole('button',{name:'Refresh data'}));await v.findByRole('alert');await waitFor(()=>assert.equal(v.getByRole('button',{name:'Refresh data'}).disabled,false));assert.ok(v.getByRole('button',{name:/Profile views 300/}));assert.ok(v.getByText(/Comparison paused/));}
});
test('expired sessions notify the shell and late requests cannot update an unmounted view',async()=>{
 let error;const v=mount({load:async()=>{throw Object.assign(new Error('expired'),{status:401});},onError:e=>{error=e;}});
 await v.findByRole('alert');assert.equal(error.status,401);v.unmount();
 let resolve;const waiting=mount({load:()=>new Promise(r=>{resolve=r;})});await waitFor(()=>assert.equal(typeof resolve,'function'));waiting.unmount();await act(async()=>resolve(connected()));
});
test('switching to a metric without annual history falls back to previous period',async()=>{
 const data=connected();data.rows.push({date:'2025-10-25',views:5});const v=mount({load:async()=>data});await v.findByRole('slider');
 fireEvent.change(v.getByLabelText('Compare with'),{target:{value:'year'}});assert.equal(v.getByLabelText('Compare with').value,'year');
 fireEvent.click(v.getByRole('button',{name:/Call clicks/}));assert.equal(v.getByLabelText('Compare with').value,'previous');
});
test('an error response with populated rows never replaces the last successful snapshot',async()=>{
 let fail=false;const load=async()=>fail?{status:'error',lastSuccessfulAt:'2026-10-26T16:00:00Z',rows:[{date:'2026-10-25',views:1}]}:connected();
 const v=mount({load});await v.findByRole('button',{name:/Profile views 300/});fail=true;
 fireEvent.click(v.getByRole('button',{name:'Refresh data'}));await v.findByRole('button',{name:'Refresh data'});
 assert.ok(v.getByRole('button',{name:/Profile views 300/}));assert.ok(v.getByText(/10:00 AM/));assert.ok(v.getByText(/Comparison paused/));
});
