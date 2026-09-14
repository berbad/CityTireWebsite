const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const util = require('node:util');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
const User = require('../models/User');
process.env.NODE_ENV = 'production';

const uri = 'mongodb://test-user:test-password@invalid.test/test';
const signingKey = 'test-only-signing-key';
let logs = [];
mock.method(console, 'log', (...args) => logs.push(util.format(...args)));
mock.method(console, 'error', (...args) => logs.push(util.format(...args)));
mock.method(SecretsManagerClient.prototype, 'send', async () => ({
  SecretString: JSON.stringify({ MONGODB_URI: uri, SECRET_KEY: signingKey })
}));
mock.method(mongoose, 'connect', async () => mongoose);
const { handler } = require('../server');

let requestNumber = 0;
async function request(path, body, method = 'POST') {
  const result = await handler({
    httpMethod: method, path, headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    requestContext: { identity: { sourceIp: `198.51.100.${++requestNumber}` } }, isBase64Encoded: false
  }, {});
  return { status: result.statusCode, body: JSON.parse(result.body) };
}

test('rejects operator-shaped and non-string credentials before querying MongoDB', async () => {
  const lookup = mock.method(User, 'findOne', async () => null);
  try {
    for (const route of ['/login', '/register']) {
      for (const body of [
        { username: { $ne: null }, password: 'valid' },
        { username: 'user', password: { $gt: '' } },
        { username: ['user'], password: 'valid' },
        { username: 'user', password: 123 },
        { username: '', password: 'valid' },
        { username: 'user', password: '' }, {}, undefined
      ]) {
        const response = await request(route, body);
        assert.equal(response.status, 400);
        assert.equal(lookup.mock.callCount(), 0, 'invalid credentials must never reach a database query');
      }
    }
  } finally { lookup.mock.restore(); }
});

test('login preserves JWT behavior without logging credentials, hashes, or tokens', async () => {
  const password = 'test-password';
  const hash = bcrypt.hashSync(password, 10);
  const lookup = mock.method(User, 'findOne', async () => ({
    _id: 'user-123', username: 'test-user', password: hash
  }));
  try {
    const response = await request('/login', { username: 'test-user', password });
    assert.equal(response.status, 200);
    assert.deepEqual(jwt.decode(response.body.token, signingKey), { id: 'user-123', username: 'test-user' });
    const output = logs.join('\n');
    for (const secret of [uri, 'test-user', hash, response.body.token, signingKey]) {
      assert.ok(!output.includes(secret), 'logs must not contain sensitive authentication data');
    }
  } finally { lookup.mock.restore(); logs = []; }
});

test('registration hashes passwords and preserves duplicate-account response', async () => {
  const lookup = mock.method(User, 'findOne', async () => null);
  let saved;
  const save = mock.method(User.prototype, 'save', async function () { saved = this; return this; });
  try {
    assert.equal((await request('/register', { username: 'new-user', password: 'test-password' })).status, 201);
    assert.equal(saved.username, 'new-user');
    assert.ok(bcrypt.compareSync('test-password', saved.password));
    lookup.mock.mockImplementation(async () => saved);
    assert.equal((await request('/register', { username: 'new-user', password: 'test-password' })).status, 400);
  } finally { lookup.mock.restore(); save.mock.restore(); }
});

test('login rejects wrong passwords and missing accounts', async () => {
  const lookup = mock.method(User, 'findOne', async () => ({ password: bcrypt.hashSync('correct', 4) }));
  try {
    assert.equal((await request('/login', { username: 'user', password: 'wrong' })).status, 400);
    lookup.mock.mockImplementation(async () => null);
    assert.equal((await request('/login', { username: 'missing', password: 'wrong' })).status, 400);
  } finally { lookup.mock.restore(); }
});

test('database failures do not leak internal errors into responses or logs', async () => {
  const internal = Object.assign(new Error('database failed with secret-uri'), { detail: 'sensitive-database-value' });
  const lookup = mock.method(User, 'findOne', async () => { throw internal; });
  logs = [];
  try {
    for (const route of ['/register', '/login']) {
      const response = await request(route, { username: 'user', password: 'password' });
      assert.equal(response.status, 500);
      assert.deepEqual(Object.keys(response.body), ['message']);
    }
    assert.ok(!logs.join('\n').includes('secret-uri'));
    assert.ok(!logs.join('\n').includes('sensitive-database-value'));
  } finally { lookup.mock.restore(); }
});

test('public greeting route remains available', async () => {
  assert.deepEqual(await request('/api', undefined, 'GET'), {
    status: 200, body: { message: 'Hello from the backend!' }
  });
});

test('malformed JSON returns a generic error without reflecting input or stack traces', async () => {
  const response = await handler({
    httpMethod: 'POST', path: '/login', headers: { 'content-type': 'application/json' },
    body: '{"password":"sensitive-input",',
    requestContext: { identity: { sourceIp: '127.0.0.1' } }, isBase64Encoded: false
  }, {});
  assert.equal(response.statusCode, 400);
  assert.ok(!response.body.includes('sensitive-input'));
  assert.ok(!response.body.includes('SyntaxError'));
  assert.ok(!response.body.includes('node_modules'));
});

test('CORS allows the production frontend and rejects unrelated origins', async () => {
  for (const [origin, allowed] of [
    ['https://www.citytireshop.com', true],
    ['https://attacker.example', false],
    ['https://www.citytireshop.com.attacker.example', false],
    ['http://localhost:3000', false]
  ]) {
    const response = await handler({
      httpMethod: 'OPTIONS', path: '/login',
      headers: { origin, 'access-control-request-method': 'POST' },
      requestContext: { identity: { sourceIp: '192.0.2.20' } }
    }, {});
    const header = response.headers['access-control-allow-origin'];
    assert.equal(header, allowed ? origin : undefined);
  }
});

test('rate limits repeated login and registration attempts from one client', async () => {
  for (const [route, limit, ip] of [['/login', 20, '192.0.2.30'], ['/register', 5, '192.0.2.31']]) {
    const event = {
      httpMethod: 'POST', path: route,
      headers: { 'content-type': 'application/json' }, body: '{}',
      requestContext: { identity: { sourceIp: ip } }, isBase64Encoded: false
    };
    for (let n = 0; n < limit; n++) assert.equal((await handler(event, {})).statusCode, 400);
    const blocked = await handler(event, {});
    assert.equal(blocked.statusCode, 429);
    assert.ok(blocked.headers['retry-after']);
    const otherClient = { ...event, requestContext: { identity: { sourceIp: '192.0.2.32' } } };
    assert.equal((await handler(otherClient, {})).statusCode, 400);
  }
});

test('Function URL v2 requests are rate limited using the trusted source IP', async () => {
  const event = {
    version: '2.0', routeKey: '$default', rawPath: '/login', rawQueryString: '',
    headers: { 'content-type': 'application/json', host: 'example.lambda-url.us-east-1.on.aws' },
    requestContext: { http: { method: 'POST', path: '/login', sourceIp: '203.0.113.15', protocol: 'HTTP/1.1' } },
    body: '{}', isBase64Encoded: false
  };
  for (let n = 0; n < 20; n++) assert.equal((await handler(event, {})).statusCode, 400);
  assert.equal((await handler(event, {})).statusCode, 429);
});
