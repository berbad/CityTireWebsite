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

The API permits the production frontend `https://www.citytireshop.com`.
Set `ALLOWED_ORIGINS` to an explicit comma-separated list to add trusted
frontends. `NODE_ENV=development` also permits `http://localhost:3000`.
Do not use a wildcard origin.

Login is limited to 20 attempts per IP per 15 minutes; registration to 5.
These in-memory limits apply per Lambda instance. A shared rate-limit store
or edge enforcement is required for a global limit across concurrent instances.

The application no longer logs database connection strings, user records, or
JWTs. Before deploying, review access to existing application logs and rotate
database credentials or invalidate tokens if they were exposed there. This
repository change cannot remove previously emitted logs or rotate cloud secrets.

GitHub Actions runs regression tests, builds, and dependency audits. Dependabot
checks all three npm projects and GitHub Actions weekly.
