const publicPaths = new Set(['/', '/home', '/about', '/services', '/contact']);
export function beforeSendPublic(event) {
  if (event.type !== 'pageview') return null;
  try {
    const url = new URL(event.url);
    const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
    if (!publicPaths.has(path)) return null;
    url.search = ''; url.hash = '';
    return { ...event, url: url.toString() };
  } catch { return null; }
}
