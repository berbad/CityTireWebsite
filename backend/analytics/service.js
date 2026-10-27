const { randomUUID } = require('node:crypto');
const { queryWindow, fetchPageviews, AnalyticsError, validDay } = require('./provider');
const ID = 'website-vercel';
const DAY = 86400000;
function createAnalytics({ connect, config = {}, clock = () => new Date(), fetchImpl, tokenProvider = async () => null }) {
  const configured = () => config.enabled === true && validDay(config.coverageStart) && /^prj_[\w]+$/.test(config.projectId || '') && /^team_[\w]+$/.test(config.teamId || '');
  const collection = async () => (await connect()).collection('analytics_snapshots');
  async function read() {
    const doc = await (await collection()).findOne({ _id: ID });
    const now = clock();
    let status = configured() ? doc?.status || 'waiting' : 'not_connected';
    if (status === 'connected' && (!doc?.lastSuccessfulAt || +now - +doc.lastSuccessfulAt > 3 * DAY || +now < +doc.lastSuccessfulAt)) status = 'delayed';
    return { status, timeZone: 'UTC', coverageStart: doc?.coverageStart || (configured() ? config.coverageStart : null),
      lastAttemptAt: doc?.lastAttemptAt?.toISOString() || null, lastSuccessfulAt: doc?.lastSuccessfulAt?.toISOString() || null,
      tokenExpiresAt: config.tokenExpiresAt && Number.isFinite(Date.parse(config.tokenExpiresAt)) ? new Date(config.tokenExpiresAt).toISOString() : null,
      reason: doc?.lastError || null, rows: (doc?.rows || []).map(({ date, pageviews }) => ({ date, pageviews })) };
  }
  async function sync() {
    if (!configured()) throw new AnalyticsError('configuration');
    const coll = await collection(), now = clock(), owner = randomUUID();
    await coll.updateOne({ _id: ID }, { $setOnInsert: { coverageStart: config.coverageStart, rows: [], status: 'waiting' } }, { upsert: true });
    // Native driver's returnDocument result is the document (includeResultMetadata:false).
    const locked = await coll.findOneAndUpdate({ _id: ID, $or: [{ leaseUntil: { $exists: false } }, { leaseUntil: { $lte: now } }] },
      { $set: { leaseOwner: owner, leaseUntil: new Date(+now + 60000), lastAttemptAt: now } }, { returnDocument: 'after', includeResultMetadata: false });
    if (!locked) return { skipped: true };
    const fence = () => ({ _id: ID, leaseOwner: owner, leaseUntil: { $gt: clock() } });
    const finish = async fields => {
      const result = await coll.updateOne(fence(), { $set: fields, $unset: { leaseOwner: '', leaseUntil: '' } });
      if (!result.matchedCount) throw new AnalyticsError('lease_lost');
    };
    try {
      if (locked.coverageStart !== config.coverageStart) throw new AnalyticsError('configuration');
      const window = queryWindow(config.coverageStart, now);
      if (!window) { await finish({ status: 'waiting', lastError: null }); return { waiting: true }; }
      if (config.tokenExpiresAt && Date.parse(config.tokenExpiresAt) <= +now) throw new AnalyticsError('unauthorized');
      const token = await tokenProvider();
      if (typeof token !== 'string' || !token) throw new AnalyticsError('unauthorized');
      const incoming = await fetchPageviews({ ...window, token, projectId: config.projectId, teamId: config.teamId, fetchImpl });
      const rows = new Map((locked.rows || []).map(row => [row.date, row]));
      incoming.forEach(row => rows.set(row.date, row));
      const year = now.getUTCFullYear(), month = now.getUTCMonth() - 25;
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const cutoff = new Date(Date.UTC(year, month, Math.min(now.getUTCDate(), lastDay))).toISOString().slice(0, 10);
      await finish({ rows: [...rows.values()].filter(row => row.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date)), status: 'connected', lastSuccessfulAt: clock(), lastError: null });
      return { updatedDays: incoming.length };
    } catch (error) {
      const allowed = ['unauthorized', 'rate_limited', 'invalid_response', 'configuration', 'lease_lost'];
      const code = allowed.includes(error.code) ? error.code : 'unavailable';
      // A stale invocation cannot touch the status or lease of its replacement.
      await coll.updateOne(fence(), { $set: { status: code === 'unauthorized' || code === 'configuration' ? 'not_connected' : 'delayed', lastError: code }, $unset: { leaseOwner: '', leaseUntil: '' } });
      throw new AnalyticsError(code);
    }
  }
  return { read, sync };
}
module.exports = { createAnalytics };
