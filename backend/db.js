const mongoose=require('mongoose');
const getSecret=require('./Secrets');
let connecting;
async function connect() {
  if(!connecting) connecting=(async()=>{
    const uri=await getSecret('MONGODB_URI');
    if(!uri) throw new Error('Database configuration missing');
    await mongoose.connect(uri,{serverSelectionTimeoutMS:5000,maxPoolSize:5,bufferCommands:false});
    return mongoose.connection;
  })().catch(error=>{connecting=undefined;throw error;});
  return connecting;
}
module.exports={connect};
