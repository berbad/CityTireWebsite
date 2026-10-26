## City Tire Website

A business website built for a local tire service company, focused on providing clear information about services, pricing, and contact options. The site is designed to help customers quickly find what they need and take action, whether that’s booking a service or getting in touch.

## Features
- Service listings (tire installation, rotation, repair, etc.)
- Pricing and service details
- Contact form and business information
- Location and hours display
- Mobile-friendly responsive design

## Tech Stack
- Frontend: (JavaScript / React)
- Backend: (Node.js, AWS Lambda)

## Security and deployment

Use Node.js 24. Install dependencies with `npm ci` in the root, `backend`,
and `my-app`. Run `npm test` and `npm run build` from the root before release.
The frontend remains in `my-app/build`; see its README for SPA hosting setup.

The Lambda configuration uses `nodejs24.x`. Build a fresh deployment package
from `backend`; generated `.serverless` archives are no longer tracked. The
package excludes development dependencies, tests, and `.env` files.

Admin requests use same-origin /api routes. Configure the Vercel server-side
CITY_TIRE_API_ORIGIN separately for each environment; previews must point only
to an isolated backend/database. The gateway has no production fallback.
Set ALLOWED_ORIGINS on Lambda to exact trusted frontend origins, including
http://localhost:3000 explicitly for local development. Never use a wildcard.

Only the existing account selected by ADMIN_USER_ID and ADMIN_EMAIL can log in.
Public registration is closed. Sessions use opaque HttpOnly cookies with a
12-hour maximum lifetime and 30-minute idle timeout, enforced in MongoDB.
Mutations also require a trusted Origin and CSRF token. Login/recovery attempts
share a MongoDB rate limit of 10 per source IP per 15-minute window; behind the
gateway, source IPs may group attempts. Password recovery invalidates previous
credential generations and sessions.

Receipts save in MongoDB before PDF generation, with idempotent requests and
immutable revisions for corrections. PDFs are stored per revision so retries
do not create receipts or change previously exported documents. Receipt totals
are individual records and do not represent total business revenue.

See [the release checklist](docs/phase-one-release.md) for configuration,
isolated preview checks, private account recovery, coordinated release and
rollback. Do not log credentials, cookie values, recovery links or customer
request bodies. Credentials exposed by legacy deployments need separate review.

GitHub Actions runs regression tests, builds, and dependency audits. Dependabot
checks all three npm projects and GitHub Actions weekly.
