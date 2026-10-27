let csrfToken = '';
async function call(path, { method = 'GET', body, pdf = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`/api${path}`, {
      method, credentials: 'same-origin', signal: controller.signal,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw Object.assign(new Error(data.message || 'This request could not be completed. Please try again.'), { status: response.status });
    }
    if (pdf) return response.blob();
    const data = response.status === 204 ? null : await response.json();
    if (data?.csrfToken) csrfToken = data.csrfToken;
    return data;
  } catch (error) {
    if (error.status) throw error;
    throw new Error('Connection interrupted. Your details are still here. Please try again.');
  } finally { clearTimeout(timer); }
}
export const api = {
  websiteAnalytics: () => call('/analytics/website'),
  session: () => call('/session'),
  login: (email, password) => call('/login', { method: 'POST', body: { email, password } }),
  logout: async () => { await call('/logout', { method: 'POST' }); csrfToken = ''; },
  recover: (token, password) => call('/recover', { method: 'POST', body: { token, password } }),
  history: (q = '', cursor = '') => call(`/receipts?q=${encodeURIComponent(q)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`),
  receipt: id => call(`/receipts/${id}`),
  save: (body, receiptId) => call(receiptId ? `/receipts/${receiptId}/revisions` : '/receipts', { method: 'POST', body }),
  pdf: (id, revision) => call(`/receipts/${id}/revisions/${revision}/pdf`, { pdf: true }),
};
