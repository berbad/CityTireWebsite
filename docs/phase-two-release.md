# Phase 2: Analytics Overview

This release adds selectable Google performance metrics, 7/30/90-day and twelve-complete-month ranges, previous-period and conditional year comparisons, an accessible touch/keyboard trend chart, exact-value table, definitions, coverage and freshness states. New Receipt and the separate receipt workflow remain available.

Google API approval is pending. The production data boundary intentionally returns an empty pending snapshot. No demonstration numbers, historical quarterly totals, OAuth secrets or scraping are shipped as live analytics. Phase 3 must replace `overviewSource.mjs` with a session-protected API and verified scheduled ingestion; this release does not check approval status or sync Google automatically. The Settings pending message is static until that integration ships.

Comparisons require complete, equal-length periods and fresh data. Missing values are never zero. Error responses preserve the previous successful snapshot and pause comparison. Twelve-month charts use monthly totals and label the complete-calendar-month period; daily ranges end yesterday in Chicago. Unmatched leap days and unequal-length annual comparisons suppress percentages. Cached data lives only in mounted component memory and is discarded at logout/navigation.

## Validation

- 31 frontend/gateway tests pass, including metric selection, chart keyboard/pointer input, missing-value gaps, zero baselines, incomplete and stale data, failed/malformed/populated-error refreshes, leap dates, receipt flow and public routes.
- 25 existing backend test entries pass against isolated MongoDB; no backend changes.
- Production Vite build passes, no new dependencies.
- Browser checked: actual pending admin at mobile and desktop widths; isolated connected chart with a missing day in mobile light/dark. Test harness files removed before final build and not committed.
- One independent whole-branch review found two data-integrity issues; both have failing-then-passing regressions. No deferred minor findings.

## Release

Preview uses the existing isolated preview backend and a preview-only branch environment. No production database, credentials or Lambda changes. Obtain owner approval of the concrete preview before merging to master (which auto-deploys the frontend). Verify the admin and public site after release. Roll back by restoring the previous Vercel production deployment if needed.
