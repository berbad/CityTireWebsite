require('dotenv').config();
const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager')
  
const getSecret = async (secretKey) => {
    try {
        const client = new SecretsManagerClient({
            region: "us-east-1",
        });

        const response = await client.send(
          new GetSecretValueCommand({
            SecretId: "citytireshop",
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
          })
        );
        let secretString = JSON.parse(response.SecretString)

        if(secretString && secretString[secretKey]) {
            return secretString[secretKey]
        } else {
            return process.env[secretKey]
        }
      } catch (error) {
        return process.env[secretKey]
      }
}  


  module.exports = getSecret