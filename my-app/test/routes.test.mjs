import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

// Load the actual JSX and router through the same transforms as the app.
test('all public SPA routes render with the upgraded router and shared navigation', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx');
    for (const route of ['/', '/home', '/about', '/services', '/contact', '/login', '/register', '/admin']) {
      const html = renderToString(React.createElement(StaticRouter, { location: route }, React.createElement(App)));
      assert.match(html, /<main[^>]*>.+<\/main>/, route);
      assert.match(html, /href="\/services"/, route);
      assert.match(html, /href="\/contact"/, route);
      if (route === '/admin') assert.match(html, /Download Receipt/);
    }
  } finally {
    await server.close();
  }
});
