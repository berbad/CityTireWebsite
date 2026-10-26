# Phase 1 release checklist

The branch is a local candidate, not a deployed release. No live account or database has been modified.

## Runtime configuration

Keep the existing Vercel frontend and Express Lambda backend. Vercel forwards `/api/*` through `my-app/api/gateway.js`, retaining the browser Origin, session cookie and CSRF header. Responses are private/no-store. The gateway has no default production target and accepts only HTTPS Lambda Function URLs in us-east-1. Vite's development proxy uses the temporary local backend on port 5000.

Configure these values privately in each environment:

- Vercel `CITY_TIRE_API_ORIGIN`: the environment's verified Lambda Function URL, without a path or trailing slash. Preview must point to a separate test Lambda/database; do not copy production here.
- Lambda `MONGODB_URI`: existing AWS secret or environment configuration, verified without printing the secret. MongoDB must support transactions (Atlas replica set).
- Lambda `ADMIN_USER_ID`: the existing, verified owner's MongoDB ID.
- Lambda `ADMIN_EMAIL`: citytirerepairshop5112@gmail.com.
- Lambda `ALLOWED_ORIGINS`: comma-separated exact HTTPS website origins. Configure only the intended frontend origins; preview must use its own configuration.
- Lambda `NODE_ENV=production`: enables Secure, HttpOnly, SameSite session cookies.

The public Lambda URL also enforces sessions, trusted mutation origins, shared login rate limits, and CSRF. The gateway does not forward client-supplied authorization or forwarding headers. Lambda source IP is the gateway's egress IP; rate limiting is conservative and may group attempts sharing that IP.

## Verify identity before recovery

Confirm which existing account belongs to the owner; never choose an account solely from a guessed username. Inspect the current Lambda's configuration and resolved database name in an authorized session without exposing the connection secret. Confirm the selected account and take a database export/backup; the cluster currently has no managed backups enabled.

`backend/scripts/recover-admin.js` defaults to a dry run, requiring the exact database name, account ID, current username, intended email and HTTPS frontend origin. It leaves credentials and other users unchanged. `--issue` additionally requires an absolute path to a NEW private directory; it saves the selected user's backup and a 30-minute one-use recovery link in owner-only files. It never prints the token or password hash. Use a private directory outside version control. Protect the backup; remove the link after use. Recovery changes only the chosen existing account's email/password and revokes its prior sessions. The user must enter and submit their new password themselves.

Example argument names (fill verified values locally; never put secrets on the command line):

```
node backend/scripts/recover-admin.js --id VERIFIED_ID --username VERIFIED_USERNAME --database VERIFIED_DATABASE --email citytirerepairshop5112@gmail.com --origin https://www.citytireshop.com
```

After review, add `--issue --output /absolute/private/new-directory`. Connect the script to the verified database using the existing secret mechanism. A user-only account backup is not a full database backup.

## Staging and cutover

1. Complete independent code review and the full tests/build/audit.
2. Confirm deployment target, backup/export, existing Lambda handler/version and previous Vercel deployment. Preserve the existing Lambda configuration and artifact for rollback.
3. Deploy an isolated preview Lambda backed by an empty test database, and a Vercel preview pointing only at it. Confirm cookie forwarding through Vercel, login/logout, expiry, history/search, correction conflicts, double-submit and PDF retry. Check iPhone Safari with the owner; local browser checks do not prove physical-device keyboard behavior.
4. Prepare the production Lambda configuration and Vercel frontend as a coordinated cutover. The new frontend cannot use the legacy backend; the legacy frontend cannot use the new authentication contract. Use a brief announced admin maintenance window, keeping the public website available.
5. Deploy the new Lambda, configure production gateway origin, stage the production frontend without assigning domains, verify it with the explicitly allowed staging origin, then promote. Do not promote a preview wired to a test database.
6. Issue the private recovery link only after the verified backend and recovery page are reachable. The owner sets the password, signs in and performs a clearly labeled test receipt workflow. Keep a record of the test receipt rather than deleting history.
7. Verify public routes, private data authorization, logout, old and revised PDF exports, and error logs without logging bodies, cookies or credentials.

Rollback: restore the prior Lambda artifact/configuration and prior Vercel deployment together. New receipt collections are additive; retain them. An account password recovery persists across code rollback; use the private backup only with explicit owner direction, never automatic data rollback. The legacy auth design has known weaknesses, so rollback should be temporary while fixing the candidate.

## Evidence so far

- Backend: 24 behavioral tests plus one test-helper module pass against disposable MongoDB replica sets.
- Frontend and gateway: 14 tests pass, including lost save responses, PDF-only retry, expired session draft retention, stale corrections and private gateway cookie forwarding.
- Production Vite build passes; backend and frontend npm audits report zero vulnerabilities.
- Local browser at 390×844 and 1280×900: login, new receipt, PDF link, searchable history, correction to revision 2 while retaining revision 1. OS dark theme observed. Physical iPhone testing and hosted gateway checks remain pending.

## Independent review

A fresh whole-branch reviewer identified recovery link format mismatch, a login racing with credential recovery, and single-item PDF overflow. Regression tests reproduced each issue before fixes. Recovery now uses a shared link builder; sessions carry a credential generation checked on login and every authenticated request; descriptions split across pages. A stale search pagination response also has a regression test and generation guard. Recovery expiry copy matches the 30-minute token. Final suites: backend25/25 (includes helper), frontend/gateway14/14, production build successful. Hosted and account-identity checks remain required.
