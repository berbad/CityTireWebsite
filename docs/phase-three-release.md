# Phase 3A release candidate

Website analytics adds public-page collection filtering, a separate UTC Overview, a protected cached read endpoint and a private daily sync entry point. Google remains pending approval. No Google, Ads or receipt data is inferred from page views.

## Verified before release

- 37 backend and 38 frontend test entries pass, production build passes.
- Independent review: no critical findings; important comparison-display issue fixed with failing/passing regression and full suite.
- Filtered Vercel read with owner-approved project token returned 13 public page views for October 26 UTC, matching the connector query. This one-day diagnostic was not imported as complete history.
- Token limited to city-tire-website, 90-day expiry; stored in dedicated AWS secret citytireshop/website-analytics. No token is present in source or frontend configuration.

## Preview

Use CityTire-admin-preview-20261026 and its explicit isolated database. Deploy the exact tested backend zip with analytics disabled and no production secret configured. The hosted preview must honestly show Website not connected; actual provider access was separately verified. Keep its trusted preview origin/alias. Do not point preview at production MongoDB or enable a production scheduler from preview.

## Production activation (requires final owner publish approval)

1. Confirm GitHub checks, hosted preview, production Lambda revision and backup. Preserve all existing auth/environment values; no admin reset is needed.
2. Set WEBSITE_PROJECT_ID=prj_zzWmVHp2Bv6rD5m46P1Lm7IePpAy and WEBSITE_TEAM_ID=team_MUgPXDSnUO56bpZWOOnqIgIQ. These identify an immutable source. If moving to another project/team later, migrate to a separate source/document; do not reuse the current history.
3. Set WEBSITE_COVERAGE_START to the next full UTC day after activation verification. Never backdate coverage based on zero-filled provider history. WEBSITE_TOKEN_EXPIRES_AT may conservatively disable before the actual token expiry; verify its date against Vercel. Set WEBSITE_SECRET_ID to the dedicated secret ARN, WEBSITE_ANALYTICS_ENABLED=true and WEBSITE_SCHEDULE_ARN to the exact deployed schedule ARN.
4. Lambda execution role needs secretsmanager:GetSecretValue for that secret only. Preserve its current policies. EventBridge Scheduler execution role trusts scheduler.amazonaws.com with source account/group restrictions and permits lambda:InvokeFunction only on MyLambdaFunction-dev-app. No public sync endpoint or URL grant.
5. Schedule cron(0 8 * * ? *) in UTC, flexible window OFF. Input exactly {"source":"citytire.analytics","scheduleArn":"<exact schedule ARN>"}. Use bounded retries (maximum2, maxeventage3600). Create disabled initially. Existing 30-second Lambda limit and a 60-second fenced Mongo lease remain.
6. Deploy backend and frontend tested tree. Verify direct invoke writes waiting/connected status as appropriate, authenticated cached reads and forbidden unauthenticated reads. Verify receipts read/PDF/public pages without making fake sales.
7. Enable schedule and verify an actual Scheduler invocation before calling daily automation complete. A short-lived one-time test schedule, using the same target and execution role, may prove delivery; delete that test schedule automatically after completion. Do not claim metrics complete before the first full reporting day and successful sync.
8. Check Lambda errors and lastAttemptAt/lastSuccessfulAt. Log out local AWS CLI and remove temporary plaintext credential after secure storage verification.

## Failures and rollback

Disable schedule first, then restore prior Lambda code/config and frontend deployment. Retain Mongo history. A failed provider run retains data and last-success time and pauses comparisons. Reconnect after auth failure; repeat transient failures on the next daily run, not in a tight loop. Do not change the coverage date to hide gaps.

## Review notes

Deferred minor: timeout error paths are tested, but no deliberately stalled eight-second fetch/body test is included; the timer covers both by inspection. Separate physical-device checks and actual scheduled delivery still require deployment verification. No plan upgrade or paid Drains is involved; existing Vercel usage plus AWS Lambda, Secrets Manager and storage billing applies.
