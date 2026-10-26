const mongoose = require('mongoose');
const { Schema } = mongoose;
const ready = new WeakMap();
function models(connection) {
  const model = (name, schema) => connection.models[name] || connection.model(name, schema);
  const User = model('User', new Schema({username:{type:String,required:true,unique:true},email:String,authGeneration:{type:Number,default:0},password:{type:String,required:true}}));
  const Session = model('Session', new Schema({tokenHash:{type:String,unique:true,required:true},userId:{type:Schema.Types.ObjectId,required:true},csrfToken:String,authGeneration:{type:Number,default:0},expiresAt:{type:Date,expires:0},idleExpiresAt:Date}));
  const LoginAttempt = model('LoginAttempt',new Schema({_id:String,count:Number,expiresAt:{type:Date,expires:0}}));
  const Recovery = model('Recovery',new Schema({userId:{type:Schema.Types.ObjectId,unique:true},tokenHash:{type:String,unique:true},expiresAt:{type:Date,expires:0}}));
  return {User,Session,LoginAttempt,Recovery,...require('./receipts').receiptModels(connection)};
}
async function initialize(connection) {
  if(!ready.has(connection)) ready.set(connection,Promise.all(Object.values(models(connection)).map(m=>m.init())).catch(error=>{ready.delete(connection);throw error;}));
  await ready.get(connection); return models(connection);
}
module.exports={models,initialize};
