const crypto=require('node:crypto');
const bcrypt=require('bcryptjs');
const {Types}=require('mongoose');
const {initialize}=require('./models');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const random=()=>crypto.randomBytes(32).toString('hex');
const dummyHash=bcrypt.hashSync('not-a-real-account-password',10);
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const cookieName=config=>config.production?'__Host-city_session':'city_session';
const cookieOptions=config=>({httpOnly:true,secure:config.production,sameSite:'lax',path:'/',maxAge:12*60*60*1000});
function cookieToken(req,config) {
  const entry=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName(config)+'='));
  const token=entry?.slice(entry.indexOf('=')+1);
  return /^[a-f0-9]{64}$/.test(token||'')?token:null;
}
const publicSession=(session,config)=>({user:{email:config.adminEmail},csrfToken:session.csrfToken});
function registerAuth(app,{connect,config,clock}) {
  const available=wrap(async(req,res,next)=>{
    try {req.connection=await connect();req.models=await initialize(req.connection);} catch {return res.status(503).json({message:'Service temporarily unavailable. Please try again.'});}
    if(!Types.ObjectId.isValid(config.adminId)||!config.adminEmail) return res.status(503).json({message:'Admin access has not been configured.'});
    next();
  });
  const trusted=(req,res,next)=>config.origins.includes(req.headers.origin)?next():res.status(403).json({message:'Request origin not allowed.'});
  const authenticate=wrap(async(req,res,next)=>{
    const token=cookieToken(req,config); if(!token) return res.status(401).json({message:'Please sign in.'});
    const now=clock();
    req.session=await req.models.Session.findOneAndUpdate({tokenHash:hash(token),userId:config.adminId,expiresAt:{$gt:now},idleExpiresAt:{$gt:now}},{$set:{idleExpiresAt:new Date(now.getTime()+30*60*1000)}},{new:true});
    const currentUser=req.session?await req.models.User.findById(config.adminId).select('authGeneration'):null;
    if(!req.session||!currentUser||(currentUser.authGeneration||0)!==(req.session.authGeneration||0)) return res.status(401).json({message:'Your session ended. Please sign in again.'});
    next();
  });
  const csrf=(req,res,next)=>{
    const supplied=req.headers['x-csrf-token'];const expected=req.session.csrfToken;
    if(typeof supplied!=='string'||!(/^[a-f0-9]{64}$/.test(supplied))||supplied.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(expected))) return res.status(403).json({message:'Please reload and try again.'});
    next();
  };
  const throttle=wrap(async(req,res,next)=>{
    const now=clock();const windowMs=15*60*1000;const bucket=Math.floor(now.getTime()/windowMs);
    const key=hash(`${req.ip}:${bucket}`);const update={$inc:{count:1},$setOnInsert:{expiresAt:new Date((bucket+2)*windowMs)}};
    let count;
    try {count=await req.models.LoginAttempt.findOneAndUpdate({_id:key},update,{upsert:true,new:true});}
    catch(error){if(error.code!==11000)throw error;count=await req.models.LoginAttempt.findOneAndUpdate({_id:key},{$inc:{count:1}},{new:true});}
    if(count.count>10) return res.set('Retry-After',String(Math.ceil(((bucket+1)*windowMs-now.getTime())/1000))).status(429).json({message:'Too many attempts. Please try again in 15 minutes.'});
    next();
  });
  app.post(['/register','/api/register'],(req,res)=>res.status(410).json({message:'Registration is closed.'}));
  app.post('/api/login',trusted,available,throttle,wrap(async(req,res)=>{
    const {email,password}=req.body||{};
    if(typeof email!=='string'||email.length>254||typeof password!=='string'||!password||Buffer.byteLength(password)>72) return res.status(400).json({message:'Enter a valid email and password.'});
    const normalized=email.trim().toLowerCase();
    const user=normalized===config.adminEmail?await req.models.User.findById(config.adminId):null;
    const passwordValid=await bcrypt.compare(password,user?.password||dummyHash);
    if(!user||!passwordValid||user.email!==config.adminEmail) return res.status(401).json({message:'Email or password is incorrect.'});
    const token=random();const now=clock();
    const session=await req.models.Session.create({tokenHash:hash(token),userId:user._id,authGeneration:user.authGeneration||0,csrfToken:random(),expiresAt:new Date(now.getTime()+12*60*60*1000),idleExpiresAt:new Date(now.getTime()+30*60*1000)});
    const currentUser=await req.models.User.findById(user._id).select('authGeneration');
    if(!currentUser||(currentUser.authGeneration||0)!==session.authGeneration){await req.models.Session.deleteOne({_id:session._id});return res.status(401).json({message:'Email or password is incorrect.'});}
    res.cookie(cookieName(config),token,cookieOptions(config)).json(publicSession(session,config));
  }));
  app.get('/api/session',available,authenticate,(req,res)=>res.json(publicSession(req.session,config)));
  app.post('/api/logout',trusted,available,authenticate,csrf,wrap(async(req,res)=>{
    await req.models.Session.deleteOne({_id:req.session._id});
    const options=cookieOptions(config);delete options.maxAge;
    res.clearCookie(cookieName(config),options).status(204).end();
  }));
  require('./recovery').registerRecovery(app,{config,clock,available,trusted,throttle,wrap});
  return {available,authenticate,trusted,csrf,wrap};
}
module.exports={registerAuth,hash,random};
