import test, { before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React from 'react';
let render,fireEvent,waitFor,cleanup,act,App,server;
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/admin'});
for(const key of ['window','document','HTMLElement','HTMLDialogElement','Node','MutationObserver'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.localStorage=dom.window.localStorage;localStorage.setItem('token','legacy-token-must-not-authorize');
dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
dom.window.scrollTo=()=>{};dom.window.confirm=()=>true;
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
let saves=[],loggedIn=true,pdfFails=false,saveFails=false,expireSave=false,correctionConflict=false,searches=[],historyResponder=null;
const saved={id:'507f1f77bcf86cd799439011',number:'CT-20261026-TEST01',revision:1,createdAt:'2026-10-26T15:00:00Z',items:[{description:'Repair',quantity:2,unitPriceCents:1995,lineTotalCents:3990}],customer:{name:'',phone:''},totalCents:3990};
globalThis.fetch=async(url,options={})=>{
 const path=String(url);let status=200,body={};
 if(path==='/api/session'){status=loggedIn?200:401;body=loggedIn?{user:{email:'citytirerepairshop5112@gmail.com'},csrfToken:'test-csrf'}:{message:'Please sign in.'};}
 else if(path==='/api/login'){loggedIn=true;body={user:{email:'citytirerepairshop5112@gmail.com'},csrfToken:'test-csrf'};}
 else if(path==='/api/recover'){body={message:'Password saved. You can sign in now.'};}
 else if(path==='/api/logout'){loggedIn=false;status=204;}
 else if(path==='/api/receipts'&&options.method==='POST'){saves.push(JSON.parse(options.body));if(expireSave)return new Response(JSON.stringify({message:'Your session ended.'}),{status:401});if(saveFails)throw new TypeError('network unavailable');body=saved;status=201;}
 else if(path.includes('/pdf')){if(pdfFails){status=503;body={message:'PDF unavailable'};}else return new Response(new Blob(['%PDF-test']),{headers:{'content-type':'application/pdf'}});}
 else if(path.startsWith('/api/receipts?')){searches.push(path);if(historyResponder)return historyResponder(path);body={receipts:[saved],nextCursor:null};}
 else if(path.endsWith('/revisions')&&options.method==='POST'){saves.push(JSON.parse(options.body));status=correctionConflict?409:201;body=correctionConflict?{message:'This receipt changed. Reopen it before correcting.'}:{...saved,revision:2};}
 else if(path==='/api/receipts/'+saved.id)body={...saved,revisions:[{...saved,modifiedAt:saved.createdAt}]};
 else{status=404;body={message:'Not found'};}
 return new Response(status===204?null:JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
};
const {BrowserRouter}=await import('react-router-dom');
before(async()=>{
 ({render,fireEvent,waitFor,cleanup,act}=await import('@testing-library/react'));
 server=await createServer({server:{middlewareMode:true,hmr:false,ws:false}});
 App=(await server.ssrLoadModule('/src/App.jsx')).default;
});
afterEach(()=>{cleanup();saves=[];pdfFails=false;saveFails=false;expireSave=false;correctionConflict=false;searches=[];historyResponder=null;loggedIn=true;window.history.replaceState({},'','/admin');});
after(async()=>{await server?.close();dom.window.close();});
const mount=()=>render(React.createElement(BrowserRouter,null,React.createElement(App)));
async function fillReceipt(view){
 fireEvent.click(await view.findByRole('button',{name:'New Receipt'}));
 fireEvent.change(view.getByLabelText('Service description 1'),{target:{value:'Repair'}});
 fireEvent.change(view.getByLabelText('Quantity 1'),{target:{value:'2'}});
 fireEvent.change(view.getByRole('textbox',{name:'Unit price 1'}),{target:{value:'19.95'}});
}
test('admin requires server session, signs in with email and omits public call controls',async()=>{
 loggedIn=false;const view=mount();await view.findByLabelText('Email');assert.equal(view.queryByLabelText('Call City Tire Repair Shop'),null);
 fireEvent.change(view.getByLabelText('Password'),{target:{value:'example-password'}});fireEvent.click(view.getByRole('button',{name:'Sign in'}));
 await view.findByRole('button',{name:'New Receipt'});
});
test('receipt starts with one service, supports add item and displays exact totals',async()=>{
 const view=mount();await fillReceipt(view);assert.equal(view.queryByLabelText('Service description 2'),null);assert.ok(view.getAllByText('$39.90').length);
 fireEvent.click(view.getByRole('button',{name:'Add Item'}));assert.ok(view.getByLabelText('Service description 2'));
});
test('PDF failure keeps the saved receipt and retry only regenerates the PDF',async()=>{
 pdfFails=true;window.open=()=>null;const view=mount();await fillReceipt(view);fireEvent.click(view.getByRole('button',{name:'Save & Open PDF'}));
 await view.findByRole('button',{name:'Retry PDF'});assert.equal(saves.length,1);assert.ok(view.getByRole('heading',{name:'Receipt saved'}));
 pdfFails=false;fireEvent.click(view.getByRole('button',{name:'Retry PDF'}));await view.findByRole('link',{name:'Open PDF'});assert.equal(saves.length,1);
});
test('uncertain save retries retain the same idempotency key and payload',async()=>{
 saveFails=true;window.open=()=>null;const view=mount();await fillReceipt(view);fireEvent.click(view.getByRole('button',{name:'Save & Open PDF'}));
 await view.findByRole('button',{name:'Retry save'});assert.equal(saves.length,1);
 saveFails=false;fireEvent.click(view.getByRole('button',{name:'Retry save'}));await view.findByRole('link',{name:'Open PDF'});
 assert.equal(saves.length,2);assert.deepEqual(saves[0],saves[1]);
});

test('expired sessions preserve the draft and reuse the original save key after sign in',async()=>{
 expireSave=true;window.open=()=>null;const view=mount();await fillReceipt(view);fireEvent.click(view.getByRole('button',{name:'Save & Open PDF'}));
 await view.findByLabelText('Password');fireEvent.change(view.getByLabelText('Password'),{target:{value:'example-password'}});fireEvent.click(view.getByRole('button',{name:'Sign in'}));
 await view.findByRole('button',{name:'Retry save'});assert.equal(view.getByLabelText('Service description 1').value,'Repair');expireSave=false;fireEvent.click(view.getByRole('button',{name:'Retry save'}));await view.findByRole('link',{name:'Open PDF'});assert.deepEqual(saves[0],saves[1]);
});
test('history searches and stale corrections show the conflict without replacing the receipt',async()=>{
 correctionConflict=true;window.open=()=>null;const view=mount();fireEvent.click(await view.findByRole('button',{name:'View receipts'}));
 fireEvent.change(await view.findByLabelText('Search receipts'),{target:{value:'Repair'}});await waitFor(()=>assert.ok(searches.some(path=>path.includes('q=Repair'))));
 fireEvent.click(await view.findByRole('button',{name:/Repair.*39.90/}));fireEvent.click(await view.findByRole('button',{name:'Correct receipt'}));fireEvent.change(view.getByLabelText('Service description 1'),{target:{value:'Corrected repair'}});fireEvent.click(view.getByRole('button',{name:'Save & Open PDF'}));
 await view.findByText('This receipt changed. Reopen it before correcting.');assert.equal(saves[0].expectedRevision,1);assert.equal(view.queryByRole('heading',{name:'Receipt saved'}),null);
});

test('a delayed page from an old search cannot replace or append to the current search',async()=>{
 let resolveOld;const oldResponse=new Promise(resolve=>{resolveOld=resolve;});const newer={...saved,id:'new-id',items:[{...saved.items[0],description:'Balance'}]};
 historyResponder=async path=>path.includes('cursor=')?oldResponse:new Response(JSON.stringify({receipts:[path.includes('q=Balance')?newer:saved],nextCursor:path.includes('q=Balance')?null:'old-cursor'}));
 const view=mount();fireEvent.click(await view.findByRole('button',{name:'View receipts'}));fireEvent.click(await view.findByRole('button',{name:'Load more receipts'}));
 fireEvent.change(view.getByLabelText('Search receipts'),{target:{value:'Balance'}});await view.findByRole('button',{name:/Balance.*39.90/});
 await act(async()=>resolveOld(new Response(JSON.stringify({receipts:[saved],nextCursor:'stale-cursor'}))));
 assert.ok(!view.queryByRole('button',{name:/Repair.*39.90/}),'stale results must not appear');assert.ok(!view.queryByRole('button',{name:'Load more receipts'}),'stale cursor must not return');
});

test('the recovery issuer URL opens the password form and removes the token from the address',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const {recoveryLink}=require('../../backend/scripts/recover-admin');
 const link=recoveryLink('https://www.citytireshop.com','a'.repeat(64));const url=new URL(link);window.history.replaceState({},'',url.pathname+url.hash);
 const view=mount();await view.findByLabelText('New password');assert.equal(window.location.hash,'');fireEvent.change(view.getByLabelText('New password'),{target:{value:'test-password-only'}});fireEvent.change(view.getByLabelText('Confirm password'),{target:{value:'test-password-only'}});fireEvent.click(view.getByRole('button',{name:'Save password'}));await view.findByText('Your password is saved.');
});
