const {createHash}=require('node:crypto');
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status,publicMessage:message});};
function normalizeReceipt(body){
 if(!body||!Array.isArray(body.items)||body.items.length<1||body.items.length>30)fail('Add between 1 and 30 service items.');
 if(typeof body.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId))fail('Save request is invalid. Please reopen the form.');
 const items=body.items.map(item=>{
  if(!item||typeof item.description!=='string'||!item.description.trim()||item.description.length>500||/[\u0000-\u0008\u000b-\u001f]/.test(item.description))fail('Each service needs a description of up to 500 characters.');
  if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>999)fail('Quantity must be a whole number from 1 to 999.');
  if(typeof item.unitPrice!=='string'||!/^\d{1,6}(\.\d{1,2})?$/.test(item.unitPrice))fail('Enter a valid price with up to two decimal places.');
  const [whole,decimal='']=item.unitPrice.split('.');const unitPriceCents=Number(whole)*100+Number(decimal.padEnd(2,'0'));
  return {description:item.description.trim(),quantity:item.quantity,unitPriceCents,lineTotalCents:item.quantity*unitPriceCents};
 });
 const customer={name:'',phone:''};
 if(body.customer!==undefined){
  if(!body.customer||Array.isArray(body.customer)||typeof body.customer!=='object'||Object.keys(body.customer).some(k=>!['name','phone'].includes(k)))fail('Customer information is invalid.');
  for(const [key,max] of [['name',120],['phone',40]]){const value=body.customer[key]??'';if(typeof value!=='string'||value.length>max||/[\u0000-\u001f]/.test(value))fail('Customer information is too long or invalid.');customer[key]=value.trim();}
 }
 const totalCents=items.reduce((sum,i)=>sum+i.lineTotalCents,0);if(totalCents>100000000)fail('Receipt total must be no more than $1,000,000.');
 return {items,customer,totalCents};
}
const fingerprint=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
module.exports={normalizeReceipt,fingerprint,fail};
