# City Tire frontend

Use Node.js 24 LTS and npm 11. Install reproducibly with `npm ci`.

- `npm start`: Vite development server at http://localhost:3000 with hot reload.
- `npm test`: receipt PDF and SPA route regression tests, run once (suitable for CI).
- `npm run build`: production site in `build/`.
- `npm run preview`: inspect the production build at http://localhost:3000.

The Vite migration replaces the unmaintained Create React App build dependency graph. React 18, the existing styles, public assets and route paths are preserved. React Router uses its patched v7 component APIs. Receipt PDFs are generated and stored by the authenticated backend using jsPDF text primitives, with actual PDF-output regression tests.

Admin API requests use same-origin `/api`. Vite proxies these to http://127.0.0.1:5000 locally. On Vercel, the gateway uses the server-only `CITY_TIRE_API_ORIGIN` for that environment; configure an isolated preview backend separately from production. Vite supplies `import.meta.env.DEV` and `import.meta.env.BASE_URL` in place of CRA's environment globals. Never put credentials into frontend environment variables: values included in a build are public.

Deploy the contents of `build/` at the domain root. Configure the static host to serve `index.html` for SPA paths (such as `/services`, `/login`, and `/admin`) while serving existing assets normally. The default development server and preview server handle these paths. The API is deployed separately.

This repository tracks `build/`; regenerate it after source or dependency updates and deploy the complete new folder so obsolete JavaScript bundles are removed. Production source maps are disabled by default and are not published. The old CRA `asset-manifest.json` is no longer generated; deployment should use `build/index.html` and its hashed asset references.

CI: `npm ci && npm test && npm run build`, followed by `npm audit --audit-level=moderate`. The lockfile includes patched runtime and build dependencies; use normal parent dependency upgrades before introducing overrides.

Tailwind 3 and postcss-nested 6 still request postcss-selector-parser 6, which is affected by GHSA-rj75-hqrm-r3gf. The targeted override uses patched 7.1.7 or later within v7 while retaining the existing Tailwind styling pipeline. Remove it when compatible parent releases select a patched parser themselves. The production CSS was compared before and after this override to check styling compatibility.

Vercel uses `my-app` as its project root. `my-app/vercel.json` explicitly selects Vite, `npm ci`, `npm run build`, and the `build` output directory so a saved Create React App preset cannot select the old build pipeline. It also rewrites the existing SPA routes to `index.html`. Keep the Vercel project root set to `my-app`.
