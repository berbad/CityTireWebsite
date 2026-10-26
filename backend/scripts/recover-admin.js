const fs=require('node:fs/promises');
const path=require('node:path');
const {Types}=require('mongoose');
const {hash,random}=require('../auth');
const recoveryLink=(origin,token)=>`${origin}/recover#token=${token}`;
async function issueRecovery({connection,adminId,username,database,email,origin,issue=false,output}){
 if(!Types.ObjectId.isValid(adminId)||!username||!database||!email)throw Error('Explicit account ID, username, database and email are required.');
 const url=new URL(origin);if(url.protocol!=='https:'||url.origin!==origin)throw Error('Use the exact HTTPS website origin.');
 if(connection.name!==database)throw Error('Database does not match the verified deployment.');
 const user=await connection.collection('users').findOne({_id:new Types.ObjectId(adminId),username});if(!user)throw Error('Account ID and username does not match.');
 if(!issue)return {dryRun:true,adminId,username,database,email};
 if(!output||!path.isAbsolute(output))throw Error('An absolute path to a NEW private backup directory is required.');
 // Never overwrite a previous backup; an existing directory is deliberately an error.
 await fs.mkdir(output,{mode:0o700});
 await fs.writeFile(path.join(output,'account-backup.json'),JSON.stringify({database,user,desiredEmail:email},null,2),{flag:'wx',mode:0o600});
 const token=random();const expiresAt=new Date(Date.now()+30*60*1000);
 await fs.writeFile(path.join(output,'recovery-link.txt'),`${recoveryLink(origin,token)}\n`,{flag:'wx',mode:0o600});
 try{const {Recovery}=await require('../models').initialize(connection);await Recovery.updateOne({userId:user._id},{$set:{tokenHash:hash(token),expiresAt}},{upsert:true});}
 catch(error){await fs.unlink(path.join(output,'recovery-link.txt'));throw error;}
 return {dryRun:false,adminId,username,database,email,expiresAt,output};
}
module.exports={issueRecovery,recoveryLink};
if(require.main===module)(async()=>{
 require('dotenv').config();const {parseArgs}=require('node:util');
 const {values}=parseArgs({options:{id:{type:'string'},username:{type:'string'},database:{type:'string'},email:{type:'string'},origin:{type:'string'},output:{type:'string'},issue:{type:'boolean',default:false}}});
 const connection=await require('../db').connect();
 try{const result=await issueRecovery({connection,adminId:values.id,username:values.username,database:values.database,email:values.email,origin:values.origin,output:values.output,issue:values.issue});console.log(JSON.stringify(result,null,2));}
 finally{await connection.close();}
})().catch(()=>{console.error('Recovery preparation failed. Verify the explicit account/database, connection, and new private output directory. No password was changed.');process.exitCode=1;});
