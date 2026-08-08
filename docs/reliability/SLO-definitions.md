# SubTrack SLO Definitions

This document attaches specific numeric targets and time windows to our defined SLIs, establishing the actual promises we measure ourselves against for the SubTrack project.

---

## SLO #1 — Availability

**Target:** 99.9% of requests succeed (non-5xx), measured over a rolling 30-day window.

*(This explicitly means our ALLOWED failure rate is 0.1% over the same 30-day window).*

**Rationale:**
99.9% ("three nines") is a widely recognized, realistic standard for a project of this scale. It is ambitious enough to be meaningful and protect the user experience, but not so strict that it becomes disconnected from reality. A small, single-cluster deployment without multi-region or multi-AZ redundancy cannot realistically support 99.95% or 99.99%. Setting a target you have no infrastructure to support is a common anti-pattern; 99.9% fits our actual architectural capability perfectly.

**Compliance Query (30-day window):**
```promql
sum(rate(subtrack_http_requests_total{status_code!~"5.."}[30d]))
/
sum(rate(subtrack_http_requests_total[30d]))
```
*(Note on limitations: Prometheus's default data retention is configured to 15 days in this cluster. Therefore, a true 30-day query will not return a full window of data until the cluster has been running with longer retention or remote storage. We use `[30d]` here to document the correct theoretical query, but in a fresh demo cluster, the effective window evaluated will be clamped to however much data actually exists.)*

---

## SLO #2 — Latency

**Target:** 95% of requests complete in under 500ms, measured over a rolling 30-day window.

**Rationale:**
500ms is a widely accepted "feels fast" threshold for a dashboard-style web application (unlike a real-time trading system which would require much stricter latency). This SLO is directly pulled from the non-functional requirements stated in our original architecture PRD. It formalizes a commitment we have already made on paper into a continuously monitored objective.

**Compliance Query (30-day window):**
```promql
sum(rate(subtrack_http_request_duration_seconds_bucket{le="0.5"}[30d]))
/
sum(rate(subtrack_http_request_duration_seconds_count[30d]))
```
*(Same retention limitations apply as the Availability query).*

---

## Consequences

If either SLO is not met over its measurement window, this is treated as a signal that reliability work takes priority over new feature development until the metric recovers. The specific policy and how this is measured/triggered is detailed in [error-budget-policy.md](./error-budget-policy.md).
