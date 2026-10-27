const {randomUUID}=require('node:crypto');
const {validDay}=require('../analytics/provider');
const {reportWeek,buildEvidence,STATUSES}=require('./evidence');
const {ReportError,validateAnalysis}=require('./contract');
const {requestReport,MODEL}=require('./provider');
const BUDGET=5000000,RESERVATION=250000;
const problem=(status,message)=>Object.assign(new Error(message),{status,publicMessage:message});
async function insertOnce(coll,doc){try{await coll.updateOne({_id:doc._id},{$setOnInsert:doc},{upsert:true});}catch(e){if(e.code!==11000)throw e;}}
async function reserveBudget(coll,{id,now}){
 if(typeof id!=='string'||id.length>100||!(now instanceof Date)||!Number.isFinite(+now))throw new ReportError('configuration');
 const month=now.toISOString().slice(0,7);await insertOnce(coll,{_id:month,reservedMicros:0,reservations:[]});
 if(await coll.findOne({_id:month,'reservations.id':id}))return true;
 const result=await coll.updateOne({_id:month,reservedMicros:{$lte:BUDGET-RESERVATION},'reservations.id':{$ne:id}},{$inc:{reservedMicros:RESERVATION},$push:{reservations:{id,at:now,amountMicros:RESERVATION}}});
 return result.modifiedCount===1||Boolean(await coll.findOne({_id:month,'reservations.id':id}));
}
const publicReport=doc=>doc?Object.fromEntries(['id','kind','week','createdAt','evidence','analysis','recommendation','version','statusHistory','model','promptVersion'].filter(k=>Object.hasOwn(doc,k)).map(k=>[k,doc[k]])):null;
function createReports({connect,config={},clock=()=>new Date(),generate=requestReport,tokenProvider=async()=>null}){
 const configured=()=>config.enabled===true&&config.model===MODEL;
 async function collections(){const connection=await connect();return{connection,reports:connection.collection('growth_reports'),jobs:connection.collection('report_jobs'),budget:connection.collection('ai_budget'),snapshots:connection.collection('analytics_snapshots')};}
 function checkId(id){if(!validDay(id)||new Date(id+'T00:00Z').getUTCDay()!==1||id>reportWeek(clock()).id)throw problem(400,'Invalid reporting week.');}
 async function list({cursor}={}){if(cursor)checkId(cursor);const {reports}=await collections();const rows=await reports.find(cursor?{_id:{$lt:cursor}}:{}).sort({_id:-1}).limit(21).toArray();return{items:rows.slice(0,20).map(publicReport),nextCursor:rows.length>20?rows[19].id:null};}
 async function get(id){checkId(id);const {reports}=await collections();const doc=await reports.findOne({_id:id});if(!doc)throw problem(404,'Report not found.');return publicReport(doc);}
 async function health(){const {reports,jobs,budget}=await collections(),now=clock(),week=reportWeek(now);const [latest,analysis,job,month]=await Promise.all([reports.findOne({},{sort:{_id:-1},projection:{id:1}}),reports.findOne({kind:'analysis'},{sort:{_id:-1},projection:{id:1}}),jobs.findOne({_id:week.id}),budget.findOne({_id:now.toISOString().slice(0,7)})]);const expired=job?.status==='running'&&(!job.leaseUntil||+job.leaseUntil<=+now);const reason=expired?'interrupted':job?.error||null;return{enabled:configured(),connection:!configured()?'not_connected':['unauthorized','provider_rejected'].includes(reason)?'needs_attention':config.testedAt?'tested':'configured',model:configured()?MODEL:null,testedAt:config.testedAt||null,schedule:{timeZone:'America/Chicago',day:'Monday',hour:9,retryDay:'Tuesday'},current:{week:week.id,status:configured()?(expired?'delayed':job?.status||'waiting'):'not_connected',lastAttemptAt:job?.lastAttemptAt?.toISOString()||null,reason},latestReportId:latest?.id||null,latestAnalysisId:analysis?.id||null,budget:{month:now.toISOString().slice(0,7),limitUsd:5,reservedUsd:(month?.reservedMicros||0)/1000000}};}
 async function updateStatus(id,body){checkId(id);if(!body||Object.keys(body).sort().join(',')!=='idempotencyKey,status,version'||!STATUSES.includes(body.status)||!Number.isSafeInteger(body.version)||body.version<0||typeof body.idempotencyKey!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.idempotencyKey))throw problem(400,'Invalid recommendation update.');
 const {reports}=await collections();const doc=await reports.findOne({_id:id});if(!doc)throw problem(404,'Report not found.');if(!doc.recommendation)throw problem(400,'This report has no recommendation.');const prior=doc.statusHistory.find(e=>e.key===body.idempotencyKey);if(prior){if(prior.to!==body.status)throw problem(409,'This change was already used. Reload the report.');return publicReport(doc);}if(doc.version!==body.version)throw problem(409,'This recommendation changed. Reload the report.');if(doc.recommendation.status===body.status)return publicReport(doc);if(doc.statusHistory.length>=1000)throw problem(400,'This recommendation has reached its change-history limit.');
 const result=await reports.findOneAndUpdate({_id:id,version:body.version,'statusHistory.key':{$ne:body.idempotencyKey}},{$set:{'recommendation.status':body.status},$inc:{version:1},$push:{statusHistory:{key:body.idempotencyKey,from:doc.recommendation.status,to:body.status,at:clock().toISOString()}}},{returnDocument:'after',includeResultMetadata:false});
 if(!result){const current=await reports.findOne({_id:id});if(current?.statusHistory.some(e=>e.key===body.idempotencyKey&&e.to===body.status))return publicReport(current);throw problem(409,'This recommendation changed. Reload the report.');}return publicReport(result);
 }
 async function run(){
 if(!configured())return{status:'not_connected'};
 const now=clock(),week=reportWeek(now);if(![1,2].includes(week.weekday))return{skipped:true};
 const {connection,reports,jobs,budget,snapshots}=await collections();
 if(await reports.findOne({_id:week.id})){await jobs.updateOne({_id:week.id},{$set:{status:'published',error:null},$unset:{leaseOwner:'',leaseUntil:''}});return{skipped:true};}
 let existing=await jobs.findOne({_id:week.id});
 if(week.weekday===2&&existing&&(existing.attempts>=2||existing.recoveryStarted||!['pending','delayed','running'].includes(existing.status)||(existing.retryAt&&+existing.retryAt>+now)))return{skipped:true};
 if(week.weekday===1&&existing&&(existing.attempts>0||!['pending','running'].includes(existing.status)))return{skipped:true};
 await insertOnce(jobs,{_id:week.id,status:'pending',attempts:0,createdAt:now});
 const owner=randomUUID();const locked=await jobs.findOneAndUpdate({_id:week.id,attempts:{$lt:2},status:{$in:week.weekday===1?['pending','running']:['pending','delayed','running']},...(week.weekday===2?{recoveryStarted:{$ne:true}}:{}),$or:[{leaseUntil:{$exists:false}},{leaseUntil:{$lte:now}}]},{$set:{...(week.weekday===2?{recoveryStarted:true}:{}),leaseOwner:owner,leaseUntil:new Date(+now+180000),lastAttemptAt:now,status:'running',error:null}},{returnDocument:'after',includeResultMetadata:false});
 if(!locked)return{skipped:true};
 const fence=()=>({_id:week.id,leaseOwner:owner,leaseUntil:{$gt:clock()}});
 async function finish(report){const session=connection.getClient().startSession();try{await session.withTransaction(async()=>{if(!await jobs.findOne(fence(),{session}))throw new ReportError('lease_lost');await reports.updateOne({_id:week.id},{$setOnInsert:report},{upsert:true,session});const updated=await jobs.updateOne(fence(),{$set:{status:'published',error:null},$unset:{leaseOwner:'',leaseUntil:'',retryAt:''}},{session});if(!updated.matchedCount)throw new ReportError('lease_lost');});}finally{await session.endSession();}return{status:'published',id:week.id};}
 try{
 const [snapshot,history]=await Promise.all([snapshots.findOne({_id:'website-vercel'}),reports.find({},{projection:{id:1,recommendation:1}}).sort({_id:-1}).toArray()]);
 const source=config.sourceEnabled===true&&snapshot?.coverageStart===config.coverageStart?snapshot:null;
 const evidence=buildEvidence({snapshot:source,now,history});const base={_id:week.id,id:week.id,week,createdAt:clock().toISOString(),evidence,version:0,statusHistory:[]};
 if(!evidence.eligible)return finish({...base,kind:'insufficient_evidence',analysis:null,recommendation:null,model:null,promptVersion:null});
 const attempt=locked.attempts+1,attemptId=`${week.id}:${attempt}`;
 if(!await reserveBudget(budget,{id:attemptId,now})){await jobs.updateOne(fence(),{$set:{status:'budget_limited',error:'budget_limited'},$unset:{leaseOwner:'',leaseUntil:''}});return{status:'budget_limited'};}
 const dispatched=await jobs.updateOne(fence(),{$set:{attempts:attempt}});if(!dispatched.matchedCount)throw new ReportError('lease_lost');
 const token=await tokenProvider();if(typeof token!=='string'||!token)throw new ReportError('unauthorized');
 const response=await generate({token,evidence});if(response.model!==MODEL)throw new ReportError('invalid_response');const analysis=validateAnalysis(response.analysis,evidence);
 return await finish({...base,kind:'analysis',analysis,recommendation:analysis.recommendation?{...analysis.recommendation,id:week.id+':priority',status:'not_started'}:null,model:MODEL,promptVersion:response.promptVersion||1});
 }catch(error){if(error.code==='lease_lost')return{skipped:true,reason:'lease_lost'};const allowed=['unauthorized','invalid_response','rate_limited','unavailable','provider_rejected','input_too_large'];const code=allowed.includes(error.code)?error.code:'unavailable',retryable=['rate_limited','unavailable'].includes(code),status=retryable?'delayed':'unavailable';await jobs.updateOne(fence(),{$set:{status,error:code,retryAt:new Date(+clock()+Math.max(0,error.retryAfterSeconds||0)*1000)},$unset:{leaseOwner:'',leaseUntil:''}});return{status};}
 }
 return{list,get,health,updateStatus,run};
}
module.exports={createReports,reserveBudget};
