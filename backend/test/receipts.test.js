const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {Types}=require('mongoose');
const bcrypt=require('bcryptjs');
const serverless=require('serverless-http');
const {openDatabase}=require('./helpers/database');
const {createApp}=require('../server');
let db,handler,cookie,csrf,created;
const config={adminId:'66f5ed4c92cd033fb1c064d9',adminEmail:'citytirerepairshop5112@gmail.com',origins:['https://www.citytireshop.com'],production:true};
const input=()=>({requestId:crypto.randomUUID(),items:[{description:'Flat tire repair',quantity:2,unitPrice:'19.95'},{description:'Valve stem',quantity:1,unitPrice:'0.10'}],customer:{name:'Test customer',phone:'773-555-0100'}});
async function request(path,{body,method='GET',authorized=true,target=handler}={}) {
 const result=await target({version:'2.0',routeKey:'$default',rawPath:path.split('?')[0],rawQueryString:path.split('?')[1]||'',headers:{host:'test.lambda-url.us-east-1.on.aws',origin:config.origins[0],'content-type':'application/json',...(authorized&&cookie?{cookie,'x-csrf-token':csrf}:{})},requestContext:{http:{method,path:path.split('?')[0],sourceIp:'192.0.2.77'}},body:body?JSON.stringify(body):undefined,isBase64Encoded:false},{});
 const pdf=result.headers['content-type']?.includes('application/pdf');
 return {status:result.statusCode,body:pdf?Buffer.from(result.body,result.isBase64Encoded?'base64':'utf8'):JSON.parse(result.body||'{}'),headers:result.headers,cookies:result.cookies||[]};
}
before(async()=>{
 db=await openDatabase();await db.connection.collection('users').insertOne({_id:new Types.ObjectId(config.adminId),username:'badel',email:config.adminEmail,password:await bcrypt.hash('test-only-password',10)});
 handler=serverless(createApp({connect:async()=>db.connection,config,clock:()=>new Date('2026-10-26T15:00:00Z')}));
 const login=await request('/api/login',{method:'POST',body:{email:config.adminEmail,password:'test-only-password'}});assert.equal(login.status,200,JSON.stringify(login));cookie=(login.cookies[0]||login.headers['set-cookie']).split(';')[0];csrf=login.body.csrfToken;
});
after(async()=>{if(db)await db.close();});
test('private receipt endpoints reject unauthenticated requests',async()=>{
 for(const [path,method] of [['/api/receipts','GET'],['/api/receipts','POST'],['/api/receipts/66f5ed4c92cd033fb1c064d9','GET']]) assert.equal((await request(path,{method,body:method==='POST'?input():undefined,authorized:false})).status,401);
});
test('save calculates exact cents and assigns immutable receipt identity',async()=>{
 const result=await request('/api/receipts',{method:'POST',body:input()});assert.equal(result.status,201);created=result.body;
 assert.equal(created.totalCents,4000);assert.equal(created.items[0].unitPriceCents,1995);assert.equal(created.revision,1);assert.match(created.number,/^CT-20261026-/);assert.equal(created.createdAt,'2026-10-26T15:00:00.000Z');
});
test('invalid and malicious receipt values are rejected without saving',async()=>{
 const before=await db.connection.collection('receipts').countDocuments();
 for(const patch of [{items:[]},{items:[{description:'x',quantity:0,unitPrice:'1'}]},{items:[{description:'x',quantity:-1,unitPrice:'1'}]},{items:[{description:'x',quantity:1,unitPrice:'1.999'}]},{items:[{description:'',quantity:1,unitPrice:'1'}]},{items:[{description:'x',quantity:1,unitPrice:'NaN'}]},{customer:{$where:'x'}},{requestId:'not-a-uuid'}])assert.equal((await request('/api/receipts',{method:'POST',body:{...input(),...patch}})).status,400);
 assert.equal(await db.connection.collection('receipts').countDocuments(),before);
});
test('concurrent double submissions and retry after a lost response save once',async()=>{
 const body=input();const results=await Promise.all(Array.from({length:5},()=>request('/api/receipts',{method:'POST',body})));
 for(const result of results)assert.ok([200,201].includes(result.status),JSON.stringify(result));
 assert.equal(new Set(results.map(r=>r.body.id)).size,1);
 assert.equal(await db.connection.collection('receipts').countDocuments({requestId:body.requestId}),1);
 const changed={...body,items:[{description:'Changed',quantity:1,unitPrice:'1'}]};assert.equal((await request('/api/receipts',{method:'POST',body:changed})).status,409);
});
test('corrections preserve original values and reject stale overwrites',async()=>{
 const body={...input(),expectedRevision:1,items:[{description:'Corrected tire repair',quantity:1,unitPrice:'25.50'}]};
 const result=await request(`/api/receipts/${created.id}/revisions`,{method:'POST',body});assert.equal(result.status,201);assert.equal(result.body.revision,2);assert.equal(result.body.totalCents,2550);
 const retry=await request(`/api/receipts/${created.id}/revisions`,{method:'POST',body});assert.equal(retry.status,200);assert.equal(retry.body.revision,2);
 assert.equal((await request(`/api/receipts/${created.id}/revisions`,{method:'POST',body:{...body,requestId:crypto.randomUUID()}})).status,409);
 const detail=await request(`/api/receipts/${created.id}`);assert.equal(detail.body.revisions.length,2);assert.equal(detail.body.revisions[0].totalCents,4000);assert.equal(detail.body.revisions[1].before.totalCents,4000);assert.equal(detail.body.revisions[1].totalCents,2550);assert.ok(detail.body.revisions[1].modifiedAt);
});
test('concurrent corrections cannot create two versions of the same revision',async()=>{
 const current=await request('/api/receipts',{method:'POST',body:input()});
 const results=await Promise.all([1,2].map(n=>request(`/api/receipts/${current.body.id}/revisions`,{method:'POST',body:{...input(),expectedRevision:1,items:[{description:'Correction '+n,quantity:1,unitPrice:'5'}]}})));
 assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
});
test('history searches text literally and paginates without duplicate entries',async()=>{
 const matched=await request('/api/receipts?q=Corrected');assert.equal(matched.status,200);assert.equal(matched.body.receipts.length,1);
 assert.equal((await request('/api/receipts?q=%5B')).status,200);
 const first=await request('/api/receipts?limit=2');assert.equal(first.body.receipts.length,2);assert.ok(first.body.nextCursor);
 const second=await request('/api/receipts?limit=2&cursor='+encodeURIComponent(first.body.nextCursor));
 assert.ok(second.body.receipts.every(r=>!first.body.receipts.some(a=>a.id===r.id)));
});
test('PDF export failure preserves the save, and successful export bytes stay fixed after corrections',async()=>{
 const saved=await request('/api/receipts',{method:'POST',body:input()});assert.equal(saved.status,201);
 const path=`/api/receipts/${saved.body.id}/revisions/1/pdf`;
 const broken=serverless(createApp({connect:async()=>db.connection,config,clock:()=>new Date('2026-10-26T15:00:00Z'),renderPdf:()=>{throw Error('PDF renderer failed');}}));
 assert.equal((await request(path,{target:broken})).status,503);
 assert.equal((await request(`/api/receipts/${saved.body.id}`)).status,200);
 const pdf=await request(path);assert.equal(pdf.status,200);assert.ok(pdf.body.subarray(0,5).equals(Buffer.from('%PDF-')));assert.match(pdf.headers['cache-control'],/no-store/);
 const text=pdf.body.toString();for(const value of ['City Tire Repair Shop',saved.body.number,'40.00','19.95','Revision: 1'])assert.ok(text.includes(value),value);
 await request(`/api/receipts/${saved.body.id}/revisions`,{method:'POST',body:{...input(),expectedRevision:1,items:[{description:'Correction',quantity:1,unitPrice:'20.00'}]}});
 const original=await request(path,{target:broken});assert.equal(original.status,200);assert.ok(pdf.body.equals(original.body),'stored PDF must not be regenerated');
 const updated=await request(`/api/receipts/${saved.body.id}/revisions/2/pdf`);assert.equal(updated.status,200);assert.ok(updated.body.toString().includes('20.00'));
 assert.equal((await request(path,{authorized:false})).status,401);
});
test('long receipt descriptions flow onto multiple PDF pages without executable content',async()=>{
 const body={...input(),items:Array.from({length:30},(_,i)=>({description:`Service ${i+1} `+'Tire repair description '.repeat(20),quantity:1,unitPrice:'1.00'}))};
 const saved=await request('/api/receipts',{method:'POST',body});assert.equal(saved.status,201);
 const pdf=await request(`/api/receipts/${saved.body.id}/revisions/1/pdf`);assert.equal(pdf.status,200);const text=pdf.body.toString();assert.ok((text.match(/\/Type \/Page\b/g)||[]).length>1);assert.ok(text.includes('Service 30'));assert.ok(!text.includes('/JavaScript'));
});
test('a single accepted description spanning pages is printed completely inside page bounds',()=>{
 const {renderReceiptPdf}=require('../pdf');const description=Array(100).fill('Tire').join('\n');
 const bytes=renderReceiptPdf({_id:'test',number:'CT-TEST-LONG',createdAt:new Date()},{revision:1,items:[{description,quantity:1,unitPriceCents:100,lineTotalCents:100}],totalCents:100});
 const streams=[...bytes.toString('latin1').matchAll(/stream\n([\s\S]*?)\nendstream/g)].map(match=>match[1]);
 const counts=streams.map(stream=>(stream.match(/\(Tire\)/g)||[]).length);assert.equal(counts.reduce((a,b)=>a+b,0),100);assert.ok(counts.every(count=>count<=40),`Description overflow: ${counts}`);
});
