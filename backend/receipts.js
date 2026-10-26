const {randomBytes}=require('node:crypto');
const {Types}=require('mongoose');
const {normalizeReceipt,fingerprint,fail}=require('./receipt-input');
const plain=value=>value?.toObject?value.toObject():value;
const snapshot=value=>{const v=plain(value);return {items:v.items.map(plain),customer:plain(v.customer),totalCents:v.totalCents};};
const summary=(receipt,revision=receipt)=>({id:String(receipt._id),number:receipt.number,createdAt:receipt.createdAt,revision:revision.revision,...snapshot(revision)});
const searchText=(number,data)=>[number,...data.items.map(i=>i.description),data.customer.name,data.customer.phone].join(' ').toLowerCase();
function registerReceipts(app,{auth,clock,config,renderPdf}){
 const {available,authenticate,trusted,csrf,wrap}=auth;
 app.use('/api/receipts',available,authenticate);
 app.use('/api/receipts',(req,res,next)=>['GET','HEAD'].includes(req.method)?next():trusted(req,res,()=>csrf(req,res,next)));
 const owner=()=>new Types.ObjectId(config.adminId);
 const validId=req=>{if(!/^[a-f0-9]{24}$/i.test(req.params.id))fail('Receipt not found.',404);};
 app.post('/api/receipts',wrap(async(req,res)=>{
  const data=normalizeReceipt(req.body),payloadHash=fingerprint(data);const {Receipt,ReceiptRevision}=req.models;
  const repeated=async()=>{const existing=await Receipt.findOne({ownerId:owner(),requestId:req.body.requestId});if(!existing)return null;if(existing.payloadHash!==payloadHash)fail('This save request was already used for a different receipt.',409);const revision=await ReceiptRevision.findOne({receiptId:existing._id,revision:1});return summary(existing,revision);};
  const duplicate=await repeated();if(duplicate)return res.json(duplicate);
  const now=clock();const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(now).replaceAll('-','');
  const id=new Types.ObjectId(),number=`CT-${date}-${randomBytes(6).toString('hex').toUpperCase()}`;
  let receipt;
  try{await req.connection.transaction(async session=>{
   [receipt]=await Receipt.create([{_id:id,ownerId:owner(),requestId:req.body.requestId,payloadHash,number,createdAt:now,revision:1,...data,searchText:searchText(number,data)}],{session});
   await ReceiptRevision.create([{ownerId:owner(),receiptId:id,revision:1,requestId:req.body.requestId,payloadHash,modifiedAt:now,...data}],{session});
  });}catch(error){if(error.code===11000){const retry=await repeated();if(retry)return res.json(retry);}throw error;}
  res.status(201).json(summary(receipt));
 }));
 app.get('/api/receipts',wrap(async(req,res)=>{
  const query={ownerId:owner()};const q=req.query.q??'';
  if(typeof q!=='string'||q.length>80)fail('Search must be at most 80 characters.');
  if(q.trim())query.searchText={$regex:q.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')};
  const limit=req.query.limit===undefined?25:Number(req.query.limit);if(!Number.isInteger(limit)||limit<1||limit>100)fail('Invalid page size.');
  if(req.query.cursor){try{if(typeof req.query.cursor!=='string'||req.query.cursor.length>200)throw Error();const cursor=JSON.parse(Buffer.from(req.query.cursor,'base64url').toString());const date=new Date(cursor.date);if(!/^[a-f0-9]{24}$/i.test(cursor.id)||!Number.isFinite(date.getTime()))throw Error();query.$or=[{createdAt:{$lt:date}},{createdAt:date,_id:{$lt:new Types.ObjectId(cursor.id)}}];}catch{fail('Invalid page cursor.');}}
  const rows=await req.models.Receipt.find(query).sort({createdAt:-1,_id:-1}).limit(limit+1).lean();const hasMore=rows.length>limit;if(hasMore)rows.pop();const last=rows.at(-1);
  res.json({receipts:rows.map(r=>summary(r)),nextCursor:hasMore?Buffer.from(JSON.stringify({date:last.createdAt,id:String(last._id)})).toString('base64url'):null});
 }));
 app.get('/api/receipts/:id',wrap(async(req,res)=>{
  validId(req);const receipt=await req.models.Receipt.findOne({_id:req.params.id,ownerId:owner()});if(!receipt)fail('Receipt not found.',404);
  const revisions=await req.models.ReceiptRevision.find({receiptId:receipt._id,ownerId:owner()}).sort({revision:1}).lean();
  res.json({...summary(receipt),revisions:revisions.map(r=>({revision:r.revision,modifiedAt:r.modifiedAt,...snapshot(r),before:r.before||null}))});
 }));
 app.post('/api/receipts/:id/revisions',wrap(async(req,res)=>{
  validId(req);const data=normalizeReceipt(req.body),expected=req.body.expectedRevision;
  if(!Number.isInteger(expected)||expected<1)fail('Invalid receipt revision.');
  const payloadHash=fingerprint({expected,...data});const {Receipt,ReceiptRevision}=req.models;
  const repeated=async()=>{const previous=await ReceiptRevision.findOne({receiptId:req.params.id,ownerId:owner(),requestId:req.body.requestId});if(!previous)return null;if(previous.payloadHash!==payloadHash)fail('This correction request was already used.',409);const header=await Receipt.findOne({_id:req.params.id,ownerId:owner()});return summary(header,previous);};
  const duplicate=await repeated();if(duplicate)return res.json(duplicate);
  let result;
  try{result=await req.connection.transaction(async session=>{
   const current=await Receipt.findOne({_id:req.params.id,ownerId:owner()}).session(session);if(!current)fail('Receipt not found.',404);
   if(current.revision!==expected)fail('This receipt changed. Reopen it before making another correction.',409);
   if(fingerprint(snapshot(current))===fingerprint(data))fail('No changes to save.');
   const next=expected+1;
   const updated=await Receipt.findOneAndUpdate({_id:current._id,revision:expected},{$set:{...data,revision:next,searchText:searchText(current.number,data)}},{new:true,session});if(!updated)fail('This receipt changed. Reopen it to continue.',409);
   await ReceiptRevision.create([{ownerId:owner(),receiptId:current._id,revision:next,requestId:req.body.requestId,payloadHash,modifiedAt:clock(),...data,before:snapshot(current)}],{session});
   return summary(updated);
  });}catch(error){if(error.code===11000||error.status===409){const retry=await repeated();if(retry)return res.json(retry);}throw error;}
  res.status(201).json(result);
 }));
 app.get('/api/receipts/:id/revisions/:revision/pdf',wrap(async(req,res)=>{
  validId(req);const version=Number(req.params.revision);if(!Number.isInteger(version)||version<1)fail('PDF not found.',404);
  const receipt=await req.models.Receipt.findOne({_id:req.params.id,ownerId:owner()});if(!receipt)fail('Receipt not found.',404);
  let revision=await req.models.ReceiptRevision.findOne({receiptId:receipt._id,ownerId:owner(),revision:version}).select('+pdf');if(!revision)fail('Revision not found.',404);
  if(!revision.pdf){
   const bytes=await (renderPdf||require('./pdf').renderReceiptPdf)(receipt,revision);
   if(!Buffer.isBuffer(bytes)||bytes.length>2*1024*1024||bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Invalid PDF output');
   await req.models.ReceiptRevision.updateOne({_id:revision._id,pdf:{$exists:false}},{$set:{pdf:bytes,templateVersion:'1'}});
   revision=await req.models.ReceiptRevision.findById(revision._id).select('+pdf');
  }
  res.type('application/pdf').set('Content-Disposition',`inline; filename="${receipt.number}-v${version}.pdf"`).send(Buffer.from(revision.pdf));
 }));

}
module.exports={registerReceipts,summary};
