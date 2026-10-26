import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {proxy}=require('../server/gateway.cjs');
function response(){return {headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.code=n;return this;},json(body){this.body=body;return this;},end(body){this.body=body;return this;}};}
test('gateway fails closed without an environment-specific backend',async()=>{const res=response();await proxy({method:'GET',query:{route:'session'},headers:{}},res,{});assert.equal(res.code,503);});
test('gateway forwards session and CSRF, strips untrusted headers, keeps cookies and PDFs private',async()=>{
 const res=response();let target,options;
 await proxy({method:'POST',query:{route:'receipts',q:'repair'},headers:{cookie:'__Host-city_session=abc',origin:'https://preview.example','x-csrf-token':'csrf',authorization:'must-not-forward'},body:{items:[]}},res,{CITY_TIRE_API_ORIGIN:'https://isolated.lambda-url.us-east-1.on.aws'},async(url,opts)=>{target=url;options=opts;return new Response('pdf',{headers:{'content-type':'application/pdf','set-cookie':'__Host-city_session=abc; Secure; HttpOnly; Path=/'}});});
 assert.equal(target,'https://isolated.lambda-url.us-east-1.on.aws/api/receipts?q=repair');assert.equal(options.headers.cookie,'__Host-city_session=abc');assert.equal(options.headers.authorization,undefined);assert.equal(options.headers['x-csrf-token'],'csrf');assert.match(res.headers['cache-control'],/no-store/);assert.equal(res.headers['set-cookie'].length,1);assert.equal(res.body.toString(),'pdf');
});
test('gateway rejects path traversal, insecure backend and oversized body without forwarding',async()=>{for(const [route,origin,body,code] of [['../session','https://isolated.lambda-url.us-east-1.on.aws',{},400],['session','http://example.com',{},503],['login','https://isolated.lambda-url.us-east-1.on.aws',{x:'x'.repeat(65537)},413]]){const res=response();await proxy({method:'POST',query:{route},headers:{},body},res,{CITY_TIRE_API_ORIGIN:origin},()=>{throw Error('must not forward');});assert.equal(res.code,code);}});
