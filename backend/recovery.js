const bcrypt=require('bcryptjs');
const {hash}=require('./auth');
function registerRecovery(app,{config,clock,available,trusted,throttle,wrap}) {
 app.post('/api/recover',trusted,available,throttle,wrap(async(req,res)=>{
  const {token,password}=req.body||{};
  if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||typeof password!=='string'||password.length<12||Buffer.byteLength(password)>72)return res.status(400).json({message:'Use a valid recovery link and a password of at least 12 characters (up to 72 bytes).'});
  const passwordHash=await bcrypt.hash(password,12);
  const recovered=await req.connection.transaction(async transaction=>{
   const ticket=await req.models.Recovery.findOneAndDelete({tokenHash:hash(token),userId:config.adminId,expiresAt:{$gt:clock()}},{session:transaction});
   if(!ticket)return false;
   const user=await req.models.User.findByIdAndUpdate(config.adminId,{$set:{email:config.adminEmail,password:passwordHash},$inc:{authGeneration:1}},{session:transaction});
   if(!user)throw new Error('Account unavailable');
   await req.models.Session.deleteMany({userId:config.adminId},{session:transaction});return true;
  });
  if(!recovered)return res.status(400).json({message:'This recovery link is invalid or expired.'});
  res.json({message:'Password saved. You can sign in now.'});
 }));
}
module.exports={registerRecovery};
