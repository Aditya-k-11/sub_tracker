# Phase 4 & 5 Integration Test Log

Run Date: 2026-07-23

## Authentication & Session Flow
- `[x]` Visit the app fresh (no session) — lands on Dashboard placeholder or redirects appropriately
- `[x]` Go to /register, submit with a password under 6 characters — confirm inline or backend validation error shows clearly, no crash
- `[x]` Register with valid data — confirm redirect to "/" and navbar shows your name
- `[x]` Refresh the page — confirm still logged in (localStorage persistence working)
- `[x]` Click "Log out" — confirm redirect to /login and navbar reverts to logged-out state
- `[x]` Log back in with the same credentials — confirm success and redirect to "/"
- `[x]` Try logging in with a wrong password — confirm the exact backend error message displays on the page, not a console-only error

## Subscription List & Empty State
- `[x]` Go to /subscriptions with zero subscriptions existing — confirm the EmptyState component shows correctly, not a blank page or crash
- `[x]` Confirm the "Add your first subscription" button is visible 

## Create Flow
- `[x]` Click "Add Subscription" — modal opens, create mode, empty fields
- `[x]` Submit with the name field empty — confirm inline validation blocks submission, no network request fires
- `[x]` Fill in a valid monthly subscription (e.g. "Netflix", cost 499, category Entertainment, a real future renewal date) — submit — confirm modal closes, toast/success feedback appears if built, and the card appears in the list without a full page reload
- `[x]` Add a second subscription marked as isTrial with a near-future trialEndDate — confirm it saves and displays the purple "trial" badge with correct "Trial ends in X days" text
- `[x]` Add a third subscription with a nextRenewalDate in the past — confirm it displays "Renewal overdue" in a warning color
- `[x]` Add 2 more subscriptions with varied categories and billing cycles, for a total of 5

## Edit Flow
- `[x]` Click "Edit" on any card — confirm the modal opens pre-filled with that exact subscription's current data
- `[x]` Change the cost and category, save — confirm the card updates correctly and instantly, and unrelated fields remain unchanged
- `[x]` Open edit on the trial subscription, uncheck isTrial — confirm the trialEndDate field disappears from the form and the card's badge correctly reverts to its regular status badge after saving

## Usage Logging Flow
- `[x]` Click "Log Usage" on an active subscription — modal opens with correct subscription name
- `[x]` Submit with an empty note — confirm success toast, modal closes
- `[x]` Log usage 2 more times on the same subscription (one with a note, one without)
- `[x]` Verify via Postman/curl that all 3 usage logs actually persisted correctly against that subscription's ID in MongoDB

## Cancel Flow
- `[x]` Click "Cancel" on an active subscription — ConfirmDialog opens with the correct subscription name in the message
- `[x]` Click the dialog's own "Cancel" (dismiss) button — confirm no API call fires and the subscription remains active
- `[x]` Click "Cancel" again, confirm this time — confirm the card updates to show "cancelled" badge without full page reload, and the "Cancel" action button no longer appears on that card
- `[x]` Verify via Postman/curl that the subscription's status is "cancelled" and cancelledAt is populated in the database, but the document still exists (soft-delete, not removed)

## Error Resilience
- `[x]` Temporarily stop the backend server entirely
- `[x]` Try loading /subscriptions fresh — confirm the page-level error state with "Retry" shows, not a blank screen or unhandled crash
- `[x]` Try submitting the add-subscription form while the backend is down — confirm a clear in-modal error message shows, form stays open, no data loss of what you typed
- `[x]` Restart the backend, click "Retry" on the page-level error — confirm it recovers and loads real data correctly
- `[x]` Retry the same form submission that failed above — confirm it now succeeds

## Session Edge Case
- `[x]` While logged in, open browser dev tools → Application → Local Storage, and manually delete the `subtrack_token` entry
- `[x]` Try any action that calls the backend — confirm the 401 interceptor from apiClient.js fires correctly and redirects you to /login automatically
- `[x]` Log back in cleanly afterward to leave the app in a normal working state

---

**Final Database State:** 5 active subscriptions, 1 cancelled subscription (6 total), 3 usage logs attached to the cancelled sub, 1 active trial subscription. Left in this state intentionally as seed-like data for Phase 6 analytics testing.
