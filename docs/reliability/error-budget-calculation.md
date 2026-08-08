# SubTrack Error Budget Calculation

This document outlines the concrete math used to derive a trackable "Error Budget" from our Service Level Objectives (SLOs).

An error budget translates an abstract percentage (like 99.9%) into a concrete amount of allowed failure over a specific window. It lets us answer the question: *"How much of our allowed failure allowance have we used up so far?"*

---

## Availability Error Budget

**Target SLO:** 99.9%
**Error budget (as a fraction):** `1 - 0.999 = 0.001` (0.1%)

**PromQL for actual failure rate over the period:**
```promql
1 - (
  sum(rate(subtrack_http_requests_total{status_code!~"5.."}[30d]))
  /
  sum(rate(subtrack_http_requests_total[30d]))
)
```

**PromQL for budget consumed (percentage):**
```promql
(
  (1 - (
    sum(rate(subtrack_http_requests_total{status_code!~"5.."}[30d]))
    /
    sum(rate(subtrack_http_requests_total[30d]))
  )) / 0.001
) * 100
```
*(Note: A result of `0` means zero budget consumed (perfect availability). `100` means the ENTIRE budget for the period is used up (we are exactly at 99.9%). Anything ABOVE `100` means we have breached the SLO entirely and are currently failing our commitment. Values over 100 are a real, meaningful state this query can produce.)*

---

## Latency Error Budget

**Target SLO:** 95% < 500ms
**Error budget (as a fraction):** `1 - 0.95 = 0.05` (5%)

**PromQL for actual "too slow" rate over the period:**
```promql
1 - (
  sum(rate(subtrack_http_request_duration_seconds_bucket{le="0.5"}[30d]))
  /
  sum(rate(subtrack_http_request_duration_seconds_count[30d]))
)
```

**PromQL for budget consumed (percentage):**
```promql
(
  (1 - (
    sum(rate(subtrack_http_request_duration_seconds_bucket{le="0.5"}[30d]))
    /
    sum(rate(subtrack_http_request_duration_seconds_count[30d]))
  )) / 0.05
) * 100
```

---

## Limitations and Practical Application

Since Prometheus's default retention in this cluster is currently 15 days, a genuine `[30d]` query will not have a full window of data until the cluster has been running continuously for that long, and will be truncated to whatever data is actually present.

For testing, demonstration, and current dashboarding purposes, we are evaluating this exact math over a `[1d]` (24 hour) rolling window. The formulas are structurally identical and correct. A true production setup would pair a longer local retention (or remote long-term storage like Thanos or Cortex) with the `[30d]` window to perform monthly compliance tracking.
