import { api } from './api';
import { normalizeSnapshot } from './analytics.mjs';
export const WEBSITE_METRICS = [{ key: 'pageviews', label: 'Website page views', explanation: 'Recorded page loads on the public website, not distinct people, Google clicks, or sales. Admin and sign-in pages are excluded. Your own visits to public pages can still be counted.' }];
export const WEBSITE_OPTIONS = { metrics: WEBSITE_METRICS, timeZone: 'UTC' };
const validDay = day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0,10) === day;
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
export function normalizeWebsiteSnapshot(raw) {
  if (!raw || raw.timeZone !== 'UTC' || (raw.coverageStart !== null && !validDay(raw.coverageStart)) || !Array.isArray(raw.rows) || raw.rows.some(row => !Number.isSafeInteger(row?.pageviews) || row.pageviews < 0 || !raw.coverageStart || row.date < raw.coverageStart)) throw new Error('Website data could not be read.');
  return { ...normalizeSnapshot(raw, WEBSITE_METRICS), timeZone: 'UTC', coverageStart: raw.coverageStart, lastAttemptAt: timestamp(raw.lastAttemptAt), tokenExpiresAt: timestamp(raw.tokenExpiresAt) };
}
export const loadWebsite = () => api.websiteAnalytics();
export function websiteStatus(data) {
  if (!data) return 'Loading website status…';
  if (data.status === 'waiting') return 'Waiting for first full day';
  if (data.status === 'not_connected') return data.rows.length ? 'Reconnect needed' : 'Website not connected';
  if (data.status === 'connected') return 'Website connected';
  return 'Updates delayed';
}
