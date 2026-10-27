const {SecretsManagerClient,GetSecretValueCommand}=require('@aws-sdk/client-secrets-manager');
const {ReportError}=require('./contract');
async function loadReportToken(secretId){if(typeof secretId!=='string'||!secretId)throw new ReportError('configuration');try{const client=new SecretsManagerClient({region:'us-east-1',maxAttempts:1});const result=await client.send(new GetSecretValueCommand({SecretId:secretId}),{abortSignal:AbortSignal.timeout(4000)});const value=JSON.parse(result.SecretString||'{}').OPENAI_API_KEY;if(typeof value!=='string'||!value)throw Error();return value;}catch{throw new ReportError('unauthorized');}}
module.exports={loadReportToken};
