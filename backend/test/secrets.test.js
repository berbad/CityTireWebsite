const test=require('node:test');const assert=require('node:assert/strict');
const {SecretsManagerClient}=require('@aws-sdk/client-secrets-manager');
const getSecret=require('../Secrets');
test('explicit environment database takes precedence over the production secret for isolated previews',async()=>{
 const before=process.env.MONGODB_URI;const send=SecretsManagerClient.prototype.send;let calls=0;
 process.env.MONGODB_URI='mongodb://isolated-test.invalid/preview';SecretsManagerClient.prototype.send=async()=>{calls++;return {SecretString:JSON.stringify({MONGODB_URI:'mongodb://production.invalid/shop'})};};
 try{assert.equal(await getSecret('MONGODB_URI'),'mongodb://isolated-test.invalid/preview');assert.equal(calls,0);}finally{SecretsManagerClient.prototype.send=send;if(before===undefined)delete process.env.MONGODB_URI;else process.env.MONGODB_URI=before;}
});
