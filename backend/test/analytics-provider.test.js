const {test}=require('node:test');
const assert=require('node:assert/strict');
let provider;try{provider=require('../analytics/provider');}catch{provider={};}
const filter="environment eq 'production' and requestPath in ('/', '/home', '/home/', '/about', '/about/', '/services', '/services/', '/contact', '/contact/')";
const options={token:'test-only-secret',projectId:'prj_test',teamId:'team_test',start:'2026-10-24',end:'2026-10-25',until:'2026-10-26'};
const payload=()=>({version:1,query:{since:'2026-10-24T00:00:00.000Z',until:'2026-10-26T00:00:00.000Z',filter,limit:31},data:[{timestamp:'2026-10-24T00:00:00.000Z',pageviews:0,visitors:0},{timestamp:'2026-10-25T00:00:00.000Z',pageviews:13,visitors:5}]});
test('coverage window excludes today and unknown history, bounded to 28 UTC dates',()=>{
 assert.equal(typeof provider.queryWindow,'function');
 assert.deepEqual(provider.queryWindow('2026-10-01',new Date('2026-10-31T02:00:00Z')),{start:'2026-10-03',end:'2026-10-30',until:'2026-10-31'});
 assert.deepEqual(provider.queryWindow('2026-10-29',new Date('2026-10-31T02:00:00Z')),{start:'2026-10-29',end:'2026-10-30',until:'2026-10-31'});
 assert.equal(provider.queryWindow('2026-11-01',new Date('2026-10-31T02:00:00Z')),null);
 for(const date of ['2026-02-30','no',''])assert.throws(()=>provider.queryWindow(date,new Date()),/configuration/i);
});
test('provider sends only public production filter and retains explicit real zero',async()=>{
 assert.equal(typeof provider.fetchPageviews,'function');
 const rows=await provider.fetchPageviews({...options,fetchImpl:async(url,init)=>{
  const u=new URL(url);assert.equal(u.origin,'https://api.vercel.com');assert.equal(u.pathname,'/v1/query/web-analytics/visits/aggregate');assert.equal(u.searchParams.get('filter'),filter);assert.equal(u.searchParams.get('until'),'2026-10-25T23:59:59.999Z');assert.equal(u.searchParams.get('by'),'day');assert.equal(init.redirect,'error');assert.equal(init.headers.Authorization,'Bearer test-only-secret');assert.ok(init.signal);return new Response(JSON.stringify(payload()));
 }});
 assert.deepEqual(rows,[{date:'2026-10-24',pageviews:0},{date:'2026-10-25',pageviews:13}]);
});
test('incomplete, duplicate, unsafe, foreign and rounded extra buckets reject the whole response',async()=>{
 const bad=[p=>p.data.pop(),p=>p.data.push(p.data[0]),p=>p.data[0].pageviews=-1,p=>p.data[0].pageviews='0',p=>p.data[0].pageviews=Number.MAX_SAFE_INTEGER+1,p=>p.data[0].timestamp='2026-10-24T05:00:00Z',p=>p.data[0].timestamp='Others',p=>p.data[0].timestamp='2026-10-23T00:00:00Z',p=>p.query.until='2026-10-27T00:00:00Z',p=>p.query.filter='',p=>p.version=2,p=>p.data.push({timestamp:'2026-10-26T00:00:00Z',pageviews:7})];
 for(const mutate of bad){const p=payload();mutate(p);await assert.rejects(()=>provider.fetchPageviews({...options,fetchImpl:async()=>new Response(JSON.stringify(p))}),e=>e.code==='invalid_response');}
});
test('provider errors are sanitized and retry/backoff is deferred instead of looping',async()=>{
 for(const [status,code] of [[401,'unauthorized'],[403,'unauthorized'],[429,'rate_limited'],[503,'unavailable']]){
  let calls=0;await assert.rejects(()=>provider.fetchPageviews({...options,fetchImpl:async()=>{calls++;return new Response('sensitive provider detail',{status,headers:{'Retry-After':'120'}});}}),e=>e.code===code&&!e.message.includes('sensitive')&&(status!==429||e.retryAfterSeconds===120));assert.equal(calls,1);
 }
 for(const fetchImpl of [async()=>{throw new DOMException('secret token','AbortError');},async()=>new Response('{bad'),async()=>new Response('x'.repeat(70000))])await assert.rejects(()=>provider.fetchPageviews({...options,fetchImpl}),e=>!e.message.includes('secret token'));
});
