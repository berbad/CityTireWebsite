const {test,before,after,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const serverless=require('serverless-http');
const crypto=require('node:crypto');
const {openDatabase}=require('./helpers/database');
let createAnalytics,createHandler;try{({createAnalytics}=require('../analytics/service'));({createHandler}=require('../analytics/handler'));}catch{}
let db,collection,now;
const config={enabled:true,projectId:'prj_test',teamId:'team_test',coverageStart:'2026-10-24',scheduleArn:'arn:aws:scheduler:us-east-1:123456789012:schedule/default/test',tokenExpiresAt:'2027-01-01T00:00:00Z'};
const body=(url,views=4)=>{const u=new URL(url);const start=new Date(u.searchParams.get('since'));const end=new Date(u.searchParams.get('until'));let rows=[];for(let d=+start;d<=+end;d+=86400000)rows.push({timestamp:new Date(d).toISOString(),pageviews:views,visitors:1});return {version:1,query:{since:start.toISOString(),until:new Date(+end+1).toISOString(),filter:u.searchParams.get('filter')},data:rows};};
const make=(opts={})=>createAnalytics({connect:async()=>db.connection,config,clock:()=>new Date(now),tokenProvider:async()=>'test-secret',fetchImpl:async url=>new Response(JSON.stringify(body(url))),...opts});
before(async()=>{db=await openDatabase();collection=db.connection.collection('analytics_snapshots');});
after(async()=>{await db?.close();});beforeEach(async()=>{now=new Date('2026-10-26T08:00:00Z');await collection.deleteMany({});});
test('cache reads never fetch provider, successful explicit zero is saved atomically',async()=>{
 assert.equal(typeof createAnalytics,'function');let calls=0;const service=make({fetchImpl:async url=>{calls++;return new Response(JSON.stringify(body(url,0)));}});
 assert.equal((await service.read()).status,'waiting');assert.equal(calls,0);
 await service.sync();const result=await service.read();assert.equal(calls,1);assert.equal(result.status,'connected');assert.deepEqual(result.rows,[{date:'2026-10-24',pageviews:0},{date:'2026-10-25',pageviews:0}]);assert.equal(result.lastSuccessfulAt,'2026-10-26T08:00:00.000Z');assert.equal(result.timeZone,'UTC');assert.ok(!JSON.stringify(result).includes('test-secret'));
});
test('future coverage waits without seeding zeros; disabled config never fetches credentials',async()=>{
 let calls=0;const service=make({config:{...config,coverageStart:'2026-10-27'},tokenProvider:async()=>{calls++;return 'test';}});await service.sync();assert.equal((await service.read()).status,'waiting');assert.deepEqual((await service.read()).rows,[]);assert.equal(calls,0);
 const disabled=make({config:{enabled:false},tokenProvider:async()=>{throw Error('must not read token');}});assert.equal((await disabled.read()).status,'not_connected');await assert.rejects(()=>disabled.sync());
});
test('failed provider preserves last good rows, sanitized status and prior success time',async()=>{
 await make().sync();const original=await make().read();now=new Date('2026-10-27T08:00:00Z');
 for(const [status,want] of [[401,'not_connected'],[429,'delayed'],[503,'delayed']]){
 const service=make({fetchImpl:async()=>new Response('private provider message',{status})});await assert.rejects(()=>service.sync());const snapshot=await service.read();assert.deepEqual(snapshot.rows,original.rows);assert.equal(snapshot.lastSuccessfulAt,original.lastSuccessfulAt);assert.equal(snapshot.status,want);assert.ok(!JSON.stringify(snapshot).includes('private provider message'));}
 const broken=make({fetchImpl:async()=>new Response('{}')});await assert.rejects(()=>broken.sync());assert.deepEqual((await broken.read()).rows,original.rows);
});
test('late corrections replace days without duplicates and stale cached reads are labeled',async()=>{
 await make().sync();await make({fetchImpl:async url=>new Response(JSON.stringify(body(url,9)))}).sync();assert.deepEqual((await make().read()).rows.map(r=>r.pageviews),[9,9]);
 now=new Date('2026-10-30T08:00:01Z');assert.equal((await make().read()).status,'delayed');
});
test('concurrent invocation is skipped; expired lease prevents older success or failure from overwriting newer data',async()=>{
 for(const fail of [false,true]){
 await collection.deleteMany({});let started,release;const ready=new Promise(r=>started=r),hold=new Promise(r=>release=r);
 const slow=make({fetchImpl:async url=>{started();await hold;if(fail)throw Error('private');return new Response(JSON.stringify(body(url,99)));}});
 const pending=slow.sync();await ready;assert.equal((await make().sync()).skipped,true);
 now=new Date(+now+61000);await make({fetchImpl:async url=>new Response(JSON.stringify(body(url,7)))}).sync();release();await assert.rejects(()=>pending);
 const result=await make().read();assert.deepEqual(result.rows.map(r=>r.pageviews),[7,7]);assert.equal(result.status,'connected');}
});
test('retention removes expired dates while keeping known days outside overlap and gaps',async()=>{
 await make().sync();await collection.updateOne({_id:'website-vercel'},{$push:{rows:{$each:[{date:'2023-01-01',pageviews:10},{date:'2026-10-01',pageviews:8}]}}});
 now=new Date('2026-12-01T08:00:00Z');await make().sync();const result=await make().read();assert.ok(!result.rows.some(r=>r.date==='2023-01-01'));assert.ok(result.rows.some(r=>r.date==='2026-10-01'));assert.ok(!result.rows.some(r=>r.date==='2026-11-01'));
});
test('only explicit configured direct events sync, HTTP bodies always use HTTP handler',async()=>{
 assert.equal(typeof createHandler,'function');let calls=0;const handler=createHandler({scheduleArn:config.scheduleArn,sync:async()=>{calls++;return {ok:true};},http:async()=>({statusCode:404})});
 const event={source:'citytire.analytics',scheduleArn:config.scheduleArn};assert.deepEqual(await handler(event,{}),{ok:true});assert.equal(calls,1);
 assert.deepEqual(await handler({...event,requestContext:{http:{method:'POST'}},body:JSON.stringify(event)},{}),{statusCode:404});assert.equal(calls,1);
 await assert.rejects(()=>handler({...event,scheduleArn:'wrong'},{}));await assert.rejects(()=>handler({},{}));assert.equal(calls,1);
});
test('website endpoint authenticates and serves sanitized cache only, no public sync route',async()=>{
 const adminId='507f1f77bcf86cd799439011';const token='a'.repeat(64);const mongoose=require('mongoose');
 await db.connection.collection('users').updateOne({_id:new mongoose.Types.ObjectId(adminId)},{$set:{username:'admin',authGeneration:0}},{upsert:true});
 await db.connection.collection('sessions').insertOne({tokenHash:crypto.createHash('sha256').update(token).digest('hex'),userId:new mongoose.Types.ObjectId(adminId),authGeneration:0,csrfToken:'b'.repeat(64),expiresAt:new Date(+now+3600000),idleExpiresAt:new Date(+now+3600000)});
 await make().sync();const app=require('../app').createApp({connect:async()=>db.connection,config:{adminId,adminEmail:'test@example.com',origins:['https://www.citytireshop.com'],production:true},clock:()=>now,analytics:make()});const handler=serverless(app);
 const request=(path,cookie,method='GET')=>handler({version:'2.0',rawPath:path,rawQueryString:'',headers:cookie?{cookie}:{},requestContext:{http:{method,path,sourceIp:'127.0.0.1'}}},{});
 assert.equal((await request('/api/analytics/website')).statusCode,401);
 const response=await request('/api/analytics/website',`__Host-city_session=${token}`);assert.equal(response.statusCode,200);assert.equal(JSON.parse(response.body).rows.length,2);assert.match(response.headers['cache-control'],/no-store/);
 assert.equal((await request('/api/analytics/sync',`__Host-city_session=${token}`,'POST')).statusCode,404);
});
