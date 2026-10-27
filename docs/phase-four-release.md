# Phase 4 weekly growth reports

Private weekly reports use complete website analytics weeks, keep facts separate from AI hypotheses, and track one recommendation or abstention. Google remains pending. Reports are scheduled Monday 9 a.m. America/Chicago, with one Tuesday recovery attempt for transient failures. Current coverage begins October 28; the first eligible two-week comparison is November 16 if both weeks are complete and fresh.

## Connection and cost

Owner approved the dedicated City Tire Weekly Reports project under berbad21@gmail.com and a 90-day Responses-only key. The key is stored in AWS Secrets Manager, never client configuration. A synthetic connection test successfully validated an abstention response using gpt-6.1-sol; 654 input and 67 output tokens, about five seconds. This proves connectivity, not a business conclusion.

The feature reserves $0.25 atomically before each attempted request, capped at $5 per UTC calendar month. Unknown outcomes retain reservations; the synthetic connection test counts toward the same budget. No automatic refunds, provider fallback, credit purchases or credit reloads. The limit does not cover unrelated OpenAI callers or AWS costs. Standard pricing assumptions are $2/M input and $10/M output, with a conservative reserve covering 32 KiB serialized request and 8192 output/reasoning tokens. Recheck pricing before any model change.

## Deployment gates

Do not publish before owner final release approval. Before that approval, run the full tests, review the whole branch, and deploy only the isolated preview. The preview uses its existing explicit Mongo database and logging-only role, with production analytics/AI secret access absent. Synthetic records belong only in preview. A separate provider smoke test must reserve actual feature budget while keeping generated output out of production history.

Production deployment preserves existing session/auth configuration and the daily website schedule. Deploy the tested zip to the API (server.handler) and a new private worker (report-worker.handler, 120 seconds, reserved concurrency one). The API needs no OpenAI secret. The worker needs logs and GetSecretValue for only the database and dedicated OpenAI secret. Do not create a Function URL. Use a dedicated Scheduler execution role restricted to this worker and the account/schedule group.

Configure REPORTS_ENABLED=true, REPORTS_MODEL=gpt-6.1-sol, REPORTS_TESTED_AT with the verified connection time, and website source/coverage consistently on API and worker. Worker additionally needs REPORTS_SECRET_ID and REPORTS_SCHEDULE_ARN. Use one schedule cron(0 9 ? * MON,TUE *) with timezone America/Chicago, flexible window OFF, bounded retries, and exact input {source:citytire.reports,scheduleArn:<configured ARN>}. The worker rejects unexpected fields, HTTP events and event-selected dates. Server clock determines week and eligibility.

Verify actual Scheduler delivery and truthful insufficient-evidence publication before claiming automation works. Confirm zero provider requests for incomplete data, secure cached reads, CSRF protection, status changes, production receipts/account preservation and unchanged daily website sync. Do not backfill historical production reports or alter the clock to fabricate a successful check.

## Rollback

Disable only the report schedule first. Restore backed-up API configuration/code and previous frontend deployment, then disable the report worker. Preserve report/budget/status history and the separate website daily schedule. Retain exact before/after code hashes and configuration privately. Credential expires January 24, 2027; renew before that date to keep future reports running.

## Reviewed candidate

62 backend and 47 frontend tests pass. The independent review’s four important findings are covered by failing/passing regressions: completed topics age out across all weekly reports; Tuesday can recover failures before a paid dispatch; generated prose must match reviewed options rather than merely pass a word blacklist; expired jobs and rejected credentials show actionable connection states. A second real synthetic call validated the stricter schema with 1031 input and 76 output tokens in about three seconds. Total connection-test reservation: $0.50.

Deferred minor items: historical report detail does not yet display the stored retrieval/generation timestamps; invalid-output jobs retain their error but not a separate immutable attempt-evidence snapshot. Last published reports and their evidence remain intact.
