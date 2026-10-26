const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const serverless = require('serverless-http');
const { openDatabase } = require('./helpers/database');
let db, handler, appFactory, now = new Date('2026-10-26T15:00:00Z');
const adminId = '507f1f77bcf86cd799439011';
const email = 'citytirerepairshop5112@gmail.com';
const origin = 'https://www.citytireshop.com';
const config = { adminId, adminEmail: email, origins: [origin], production: true };
let ip = 0;
async function request(path, { body, method = 'POST', cookie, csrf, sourceIp, requestOrigin = origin, target = handler } = {}) {
  const response = await target({ version:'2.0', routeKey:'$default', rawPath:path.split('?')[0], rawQueryString:path.split('?')[1] || '',
    headers:{ host:'example.lambda-url.us-east-1.on.aws', 'content-type':'application/json', ...(requestOrigin ? {origin:requestOrigin} : {}), ...(cookie ? {cookie} : {}), ...(csrf ? {'x-csrf-token':csrf} : {}) },
    requestContext:{http:{method,path:path.split('?')[0],sourceIp:sourceIp || `192.0.2.${++ip}`}}, body:body === undefined ? undefined : JSON.stringify(body), isBase64Encoded:false
  }, {});
  return {status:response.statusCode, headers:response.headers, cookies:response.cookies || [], body:JSON.parse(response.body || '{}')};
}
before(async () => {
  // Dynamic load lets the first test explicitly report the missing application contract.
  const source = require('../server');
  assert.equal(typeof source.createApp, 'function', 'backend must expose a testable session application');
  appFactory = source.createApp;
  db = await openDatabase();
  await db.connection.collection('users').insertMany([
    {_id:new (require('mongoose').Types.ObjectId)(adminId), username:'badel', email, password:await bcrypt.hash('test-only-password',10)},
    {username:'a',email:'other@example.com',password:await bcrypt.hash('test-only-password',10)}
  ]);
  handler = serverless(appFactory({connect:async()=>db.connection,config,clock:()=>new Date(now)}));
});
after(async()=>{if(db) await db.close();});
test('registration is closed at both legacy and API URLs',async()=>{
  for(const path of ['/register','/api/register']) assert.equal((await request(path,{body:{username:'new',password:'password'}})).status,410);
  assert.equal(await db.connection.collection('users').countDocuments(),2);
});
test('login accepts only the selected admin and returns a secure cookie instead of a browser token',async()=>{
  const result=await request('/api/login',{body:{email:email.toUpperCase(),password:'test-only-password'}});
  assert.equal(result.status,200); assert.equal(result.body.token,undefined); assert.equal(result.body.user.email,email);
  const cookie=result.cookies[0] || result.headers['set-cookie'];
  for(const flag of ['__Host-city_session=','HttpOnly','Secure','SameSite=Lax','Path=/']) assert.ok(cookie.includes(flag),flag);
  assert.ok(!cookie.includes('Domain='));
  const raw=cookie.split(';')[0].split('=')[1];
  const saved=await db.connection.collection('sessions').findOne({tokenHash:crypto.createHash('sha256').update(raw).digest('hex')});
  assert.ok(saved); assert.ok(!JSON.stringify(saved).includes(raw));
  const session=await request('/api/session',{method:'GET',cookie:cookie.split(';')[0]});
  assert.equal(session.status,200); assert.ok(session.body.csrfToken); assert.match(session.headers['cache-control'],/no-store/);
});
test('invalid, missing and other-account credentials have the same generic response',async()=>{
  const results=[];
  for(const body of [{email,password:'incorrect'},{email:'missing@example.com',password:'incorrect'},{email:'other@example.com',password:'test-only-password'}]) results.push(await request('/api/login',{body}));
  for(const result of results){assert.equal(result.status,401);assert.deepEqual(result.body,results[0].body);}
  for(const body of [{email:{$ne:null},password:'x'},{email,password:{$gt:''}},{}]) assert.equal((await request('/api/login',{body})).status,400);
});
test('missing and forged cookies cannot read private data',async()=>{
  assert.equal((await request('/api/session',{method:'GET'})).status,401);
  assert.equal((await request('/api/session',{method:'GET',cookie:'__Host-city_session=forged'})).status,401);
});
test('mutations require trusted origin and CSRF; logout revokes sessions',async()=>{
  const login=await request('/api/login',{body:{email,password:'test-only-password'}});
  const cookie=(login.cookies[0]||login.headers['set-cookie']).split(';')[0];
  assert.equal((await request('/api/logout',{cookie})).status,403);
  assert.equal((await request('/api/logout',{cookie,csrf:login.body.csrfToken,requestOrigin:'https://evil.example'})).status,403);
  assert.equal((await request('/api/logout',{cookie,csrf:login.body.csrfToken})).status,204);
  assert.equal((await request('/api/session',{method:'GET',cookie})).status,401);
  assert.equal((await request('/api/login',{body:{email,password:'test-only-password'},requestOrigin:null})).status,403);
});
test('sessions expire server-side even before MongoDB TTL cleanup',async()=>{
  const login=await request('/api/login',{body:{email,password:'test-only-password'}});
  const cookie=(login.cookies[0]||login.headers['set-cookie']).split(';')[0];
  now=new Date(now.getTime()+31*60*1000);
  assert.equal((await request('/api/session',{method:'GET',cookie})).status,401);
});
test('rate limits are shared by separately constructed Lambda applications',async()=>{
  const second=serverless(appFactory({connect:async()=>db.connection,config,clock:()=>new Date(now)}));
  for(let n=0;n<10;n++) assert.equal((await request('/api/login',{body:{email,password:'wrong'},sourceIp:'198.51.100.9',target:n%2?second:handler})).status,401);
  assert.equal((await request('/api/login',{body:{email,password:'wrong'},sourceIp:'198.51.100.9',target:second})).status,429);
});
test('database failures return unavailable and never expose internals',async()=>{
  const broken=serverless(appFactory({connect:async()=>{throw new Error('private connection string');},config}));
  const result=await request('/api/session',{method:'GET',target:broken});
  assert.equal(result.status,503); assert.ok(!JSON.stringify(result).includes('private connection string'));
});
test('malformed CSRF tokens are rejected as forbidden, not internal errors',async()=>{
  const login=await request('/api/login',{body:{email,password:'test-only-password'}});
  const cookie=(login.cookies[0]||login.headers['set-cookie']).split(';')[0];
  assert.equal((await request('/api/logout',{cookie,csrf:'é'.repeat(64)})).status,403);
});
test('recovery is single use, preserves account identity and revokes prior sessions',async()=>{
  const token=crypto.randomBytes(32).toString('hex');
  const login=await request('/api/login',{body:{email,password:'test-only-password'}});
  const cookie=(login.cookies[0]||login.headers['set-cookie']).split(';')[0];
  await db.connection.collection('recoveries').insertOne({userId:new (require('mongoose').Types.ObjectId)(adminId),tokenHash:crypto.createHash('sha256').update(token).digest('hex'),expiresAt:new Date(now.getTime()+60000)});
  assert.equal((await request('/api/recover',{body:{token,password:'new-test-password'}})).status,200);
  assert.equal((await request('/api/session',{method:'GET',cookie})).status,401);
  assert.equal((await request('/api/recover',{body:{token,password:'other-test-password'}})).status,400);
  assert.equal((await request('/api/login',{body:{email,password:'new-test-password'}})).status,200);
  const account=await db.connection.collection('users').findOne({username:'badel'});assert.equal(String(account._id),adminId);
  assert.equal(await db.connection.collection('users').countDocuments(),2);
});
test('a password reset racing with an old-password login cannot leave an authorized session',async()=>{
 const original=bcrypt.compare;let release,started;const paused=new Promise(resolve=>{release=resolve;});const comparing=new Promise(resolve=>{started=resolve;});
 bcrypt.compare=async(password,value)=>{const valid=await original(password,value);if(password==='new-test-password'){started();await paused;}return valid;};
 try{
  const login=request('/api/login',{body:{email,password:'new-test-password'}});await comparing;
  const token=crypto.randomBytes(32).toString('hex');await db.connection.collection('recoveries').insertOne({userId:new (require('mongoose').Types.ObjectId)(adminId),tokenHash:crypto.createHash('sha256').update(token).digest('hex'),expiresAt:new Date(now.getTime()+60000)});
  assert.equal((await request('/api/recover',{body:{token,password:'another-reset-password'}})).status,200);release();
  assert.equal((await login).status,401);assert.equal(await db.connection.collection('sessions').countDocuments(),0);
 }finally{release();bcrypt.compare=original;}
});
