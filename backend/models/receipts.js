const {Schema}=require('mongoose');
const item=new Schema({description:String,quantity:Number,unitPriceCents:Number,lineTotalCents:Number},{_id:false});
const customer=new Schema({name:String,phone:String},{_id:false});
const snapshot=new Schema({items:[item],customer,totalCents:Number},{_id:false});
function receiptModels(connection){
 const header=new Schema({ownerId:{type:Schema.Types.ObjectId,required:true},requestId:{type:String,required:true},payloadHash:String,number:{type:String,unique:true,required:true},createdAt:Date,revision:Number,items:[item],customer,totalCents:Number,searchText:String});
 header.index({ownerId:1,requestId:1},{unique:true});header.index({ownerId:1,createdAt:-1,_id:-1});
 const revision=new Schema({ownerId:Schema.Types.ObjectId,receiptId:Schema.Types.ObjectId,revision:Number,requestId:String,payloadHash:String,modifiedAt:Date,items:[item],customer,totalCents:Number,before:snapshot,pdf:{type:Buffer,select:false},templateVersion:String});
 revision.index({receiptId:1,revision:1},{unique:true});revision.index({receiptId:1,requestId:1},{unique:true});
 return {Receipt:connection.models.Receipt||connection.model('Receipt',header),ReceiptRevision:connection.models.ReceiptRevision||connection.model('ReceiptRevision',revision)};
}
module.exports={receiptModels};
