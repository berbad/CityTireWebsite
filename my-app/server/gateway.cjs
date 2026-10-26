// No production fallback: each Vercel environment must name its own backend.
async function proxy(req,res,env=process.env,fetcher=fetch){
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const fail=(code,message)=>res.status(code).json({message});
 const route=req.query?.route;
 if(typeof route!=='string'||!/^[-a-zA-Z0-9]+(?:\/[-a-zA-Z0-9]+)*$/.test(route))return fail(400,'Invalid API path.');
 let origin;try{origin=new URL(env.CITY_TIRE_API_ORIGIN);if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash||!origin.hostname.endsWith('.lambda-url.us-east-1.on.aws'))throw Error();}catch{return fail(503,'Admin service has not been connected for this environment.');}
 if(!['GET','POST'].includes(req.method))return fail(405,'Method not allowed.');
 const url=new URL(`/api/${route}`,origin);
 for(const [key,value]of Object.entries(req.query||{}))if(key!=='route'&&typeof value==='string')url.searchParams.set(key,value);
 const headers={};for(const key of ['cookie','origin','x-csrf-token'])if(typeof req.headers[key]==='string')headers[key]=req.headers[key];
 let body;if(req.method==='POST'){body=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});if(Buffer.byteLength(body)>65536)return fail(413,'Request too large.');headers['content-type']='application/json';}
 try{
  const result=await fetcher(url.toString(),{method:req.method,headers,body,redirect:'error',signal:AbortSignal.timeout(25000)});
  for(const key of ['content-type','content-disposition','retry-after']){const value=result.headers.get(key);if(value)res.setHeader(key,value);}
  const cookies=result.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  return res.status(result.status).end(Buffer.from(await result.arrayBuffer()));
 }catch{return fail(503,'Service temporarily unavailable. Please retry.');}
}
module.exports={proxy};
