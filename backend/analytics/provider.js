const DAY = 86400000;
const FILTER = "environment eq 'production' and requestPath in ('/', '/home', '/home/', '/about', '/about/', '/services', '/services/', '/contact', '/contact/')";
const iso = date => date.toISOString().slice(0, 10);
const dayNumber = day => Date.parse(`${day}T00:00:00Z`);
function validDay(day) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(dayNumber(day)) && iso(new Date(dayNumber(day))) === day;
}
class AnalyticsError extends Error {
  constructor(code, retryAfterSeconds) { super(`Website analytics ${code}.`); this.code = code; this.retryAfterSeconds = retryAfterSeconds; }
}
function queryWindow(coverageStart, now) {
  if (!validDay(coverageStart) || !Number.isFinite(+now)) throw new AnalyticsError('configuration');
  const until = iso(now), end = iso(new Date(dayNumber(until) - DAY));
  if (coverageStart > end) return null;
  return { start: [coverageStart, iso(new Date(dayNumber(until) - 28 * DAY))].sort().at(-1), end, until };
}
async function fetchPageviews({ token, projectId, teamId, start, end, until, fetchImpl = fetch }) {
  if (!token || !projectId || !teamId || ![start, end, until].every(validDay) || start > end || dayNumber(until) - dayNumber(end) !== DAY || dayNumber(until) - dayNumber(start) > 28 * DAY) throw new AnalyticsError('configuration');
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/visits/aggregate');
  url.search = new URLSearchParams({ projectId, teamId, since: `${start}T00:00:00.000Z`, until: `${end}T23:59:59.999Z`, by: 'day', limit: '31', filter: FILTER });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: controller.signal });
    if (!response.ok) {
      const retry = Number(response.headers.get('Retry-After'));
      throw new AnalyticsError([401, 403].includes(response.status) ? 'unauthorized' : response.status === 429 ? 'rate_limited' : 'unavailable', Number.isFinite(retry) && retry > 0 ? Math.min(retry, 86400) : undefined);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new AnalyticsError('invalid_response');
    let bytes = 0; const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 65536) { await reader.cancel(); throw new AnalyticsError('invalid_response'); }
      chunks.push(Buffer.from(value));
    }
    let raw; try { raw = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AnalyticsError('invalid_response'); }
    const expected = (dayNumber(until) - dayNumber(start)) / DAY;
    if (raw?.version !== 1 || raw.query?.filter !== FILTER || Date.parse(raw.query?.since) !== dayNumber(start) || Date.parse(raw.query?.until) !== dayNumber(until) || !Array.isArray(raw.data) || raw.data.length !== expected) throw new AnalyticsError('invalid_response');
    const seen = new Set();
    const rows = raw.data.map(row => {
      const date = typeof row?.timestamp === 'string' ? row.timestamp.slice(0, 10) : '';
      if (!validDay(date) || Date.parse(row.timestamp) !== dayNumber(date) || date < start || date > end || seen.has(date) || !Number.isSafeInteger(row.pageviews) || row.pageviews < 0) throw new AnalyticsError('invalid_response');
      seen.add(date); return { date, pageviews: row.pageviews };
    });
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) { throw error instanceof AnalyticsError ? error : new AnalyticsError('unavailable'); }
  finally { clearTimeout(timeout); }
}
module.exports = { queryWindow, fetchPageviews, AnalyticsError, validDay };
