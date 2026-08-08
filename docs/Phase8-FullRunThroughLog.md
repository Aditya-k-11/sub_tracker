# Phase 8: Full QA Run-Through Log
**Date Run:** 2026-07-24

### Authentication & Session
- [x] Register a brand-new second test user (separate from the demo@subtrack.dev account) — confirm registration, redirect, and navbar all work correctly
- [x] Log out, log back in as demo@subtrack.dev / Demo@1234 — confirm dashboard loads with the full seeded dataset
- [x] Refresh the page — confirm session persists (still logged in)
- [x] Confirm the second test user's dashboard/subscriptions are completely empty and separate from the demo user's data (ownership isolation still holds with real accounts, not just earlier throwaway test users)

### Subscriptions Page
- [x] Confirm all 9 seeded subscriptions display with correct names, costs, categories, and billing cycles
- [x] Confirm the cancelled subscription (Old Gym Membership) shows the correct "cancelled" badge and its Cancel action button is hidden
- [x] Confirm the trial subscription (Claude Pro) shows the purple trial badge and correct "Trial ends in X days" text
- [x] Confirm no subscription shows an incorrect "Renewal overdue" state (none of the seeded data should be overdue — if one shows as overdue unexpectedly, flag it)
- [x] Edit one subscription's cost — confirm it updates correctly and the dashboard's totals reflect the change after revisiting it
- [x] Add one new temporary subscription, then cancel it — confirm the soft-delete behavior (still visible, marked cancelled) works correctly
- [x] Log usage against 2–3 different subscriptions — confirm success toasts and correct persistence (spot check via the usage summary endpoint or Postman if useful)

### Dashboard — Summary & Charts
- [x] Confirm the total monthly spend figure matches a manual hand-calculation across all ACTIVE (non-cancelled) seeded subscriptions, accounting for billing-cycle normalization
- [x] Confirm active subscription count and trial count are both correct
- [x] Confirm the category donut chart's legend totals match the summary figure, and colors are consistent (not random defaults)
- [x] Confirm the trend chart shows a believable multi-month upward slope with at least 4 data points, and hovering shows correct currency values per month

### Dashboard — Wasted Spend
- [x] Confirm Gold's Gym is flagged, with a correct reason string and no cost-per-use (since it has zero usage logs)
- [x] Confirm Disney+ Hotstar is NOT flagged (per the margin adjustment made in 8.2)
- [x] Confirm potential monthly savings shown matches Gold's Gym's normalized monthly cost exactly (assuming it's the only one flagged)
- [x] Click "Log usage" directly from the wasted-spend panel on Gold's Gym — confirm it disappears from the flagged list without a page reload, then run `resetDemoLiveState.js` afterward to restore the demo-ready state for future runs

### Dashboard — Notifications & Renewals
- [x] Confirm the notification bell shows the correct unread count matching Spotify (renewal) + Claude Pro (trial)
- [x] Confirm Claude Pro sorts above Spotify in both the dropdown and the RenewalCalendarPanel, with correct priority styling (amber vs blue)
- [x] Mark one notification as read — confirm it updates immediately and the badge count decreases
- [x] Mark all as read — confirm the badge disappears entirely
- [x] Refresh the page — confirm read/unread state persisted correctly from the backend, not just local session state
- [x] Run `node scripts/seed/resetDemoLiveState.js` afterward to restore fresh unread notifications for future testing/demo runs

### Cross-Cutting Resilience Checks
- [x] Temporarily stop the backend server entirely — confirm the dashboard, subscriptions page, and notification fetches all show clear error/retry states rather than silent failures, blank screens, or unhandled console crashes anywhere
- [x] Restart the backend — confirm every page recovers correctly via its retry mechanism without requiring a full app reload
- [x] Manually corrupt the stored JWT in localStorage while logged in, then trigger any authenticated action — confirm the global 401 interceptor redirects to /login cleanly
- [x] Resize the browser across mobile, tablet, and desktop widths on both the Dashboard and Subscriptions pages — confirm no layout breakage, overlapping text, or horizontal scroll issues anywhere

### Data Integrity Spot Checks
- [x] Call GET /api/analytics/summary, /categories, /trend, /wasted, and GET /api/notifications directly — confirm every response matches exactly what the frontend is displaying (catches any silent frontend-side miscalculation or stale caching issue)
- [x] Confirm the demo user's SpendSnapshot collection has exactly one document per distinct month, no duplicates (upsert logic from 6.2 holding correctly even after this whole testing pass has hit those endpoints repeatedly)

---

**Closing Note:**
The application is fully verified. 
- The previously identified bug (Cancelled Subscriptions showing "Renewal Overdue") has been fixed.
- The "Missing Toast" issue on the Dashboard has been fixed by integrating the `<Toast />` component into the `DashboardPage.jsx` hierarchy.
- The perceived logout unresponsiveness was just an automated testing browser quirk; manually verifying through the browser confirmed that the React Router Context logic cleanly and responsively clears state and redirects.

Phase 8 is completely done. The SubTrack application is functionally complete, fully QA'd against live data, and perfectly demo-ready. We are officially cleared to begin containerization (Phase 9).
