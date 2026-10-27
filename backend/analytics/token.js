const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { AnalyticsError } = require('./provider');
// Explicit secret ID required in every environment. No production fallback.
async function loadAnalyticsToken(secretId) {
  if (!secretId) throw new AnalyticsError('configuration');
  const client = new SecretsManagerClient({ region: 'us-east-1', maxAttempts: 1 });
  try {
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }), { abortSignal: AbortSignal.timeout(4000) });
    const token = JSON.parse(response.SecretString || '{}').WEBSITE_ANALYTICS_TOKEN;
    if (typeof token !== 'string' || !token) throw new Error();
    return token;
  } catch { throw new AnalyticsError('configuration'); }
  finally { client.destroy(); }
}
module.exports = { loadAnalyticsToken };
