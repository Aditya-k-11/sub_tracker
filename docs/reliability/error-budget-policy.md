# SubTrack Error Budget Policy

## Purpose
This document defines objective, pre-agreed responses to the state of the "SubTrack" error budget. The purpose of this policy is to resolve the recurring tension between shipping new features and fixing reliability issues without needing to re-litigate the decision during an active incident or sprint planning. By relying on an objective trigger, this policy ensures that if the budget says "stop," we stop—regardless of the perceived urgency of pending features.

## The Policy — Three Tiers

### Tier 1 — Budget Healthy (< 50% consumed, no active burn-rate alerts)
Normal operation. Feature development proceeds as planned. Standard code review and testing practices apply. No special reliability focus is required beyond normal engineering discipline.

### Tier 2 — Budget Warning (50-100% consumed, OR the Slow Burn alert is firing)
- New feature work may continue, but every pull request must now include an explicit note on reliability impact (e.g., does this change add new failure modes, external dependencies, or latency-sensitive paths?).
- Any planned risky changes (such as a schema migration or a new external API integration) should be deferred if reasonably possible until the budget recovers.
- A brief written note should be added to the **Incident Log** section below identifying the likely cause of the consumption, even if no immediate action is taken.

### Tier 3 — Budget Exhausted (≥ 100% consumed, OR the Fast Burn alert is firing)
- **All new feature development pauses.** This is the core, non-negotiable rule — engineering effort redirects entirely to identifying and fixing the root cause of the reliability degradation.
- No new code merges to `main` except fixes directly addressing the reliability issue, until the budget recovers below 100% AND no burn-rate alerts are actively firing.
- A retrospective/postmortem (using the template below) is written once resolved, before resuming normal feature work.

## What "Fixing It" Actually Means
The Tier 3 pause isn't indefinite, nor is it based on vague feelings of stability. It ends specifically when: the root cause is identified, a fix is deployed, **AND the burn-rate alerts have cleared**. We don't just "make a change and hope it worked"; the C.4 alerting infrastructure itself serves as the objective signal that confirms recovery, closing the loop back to our monitoring tooling.

## Incident Log
| Date | Tier Triggered | SLO Affected | Root Cause | Resolution | Time to Recover |
|---|---|---|---|---|---|
| 2026-08-04 | Tier 3 (Fast Burn) | Availability | Deliberate scale-down of MongoDB deployment and simulated route failure (`503 Service Unavailable`) for testing. | Restored MongoDB to 1 replica and removed artificial `503` endpoint. | ~5 minutes |

## Postmortem Template
*This template should be used for real Tier 3 incidents to facilitate blameless retrospectives.*

- **What Happened:** (Brief summary of the incident and its impact)
- **Timeline:** (Key timestamps: when it started, when the alert fired, when it was resolved)
- **Root Cause:** (Technical and systemic reasons why the failure occurred)
- **What Went Well:** (Things that worked during the response, e.g., "Alert fired quickly")
- **What Could Improve:** (Gaps in process, tooling, or architecture)
- **Action Items:** (Concrete steps to prevent recurrence)

## Explicit Acknowledgment of Scope
This policy is written and demonstrated for a solo-developer portfolio project. In a real team setting, this same policy would additionally specify **WHO** has authority to declare Tier 3, **WHO** gets paged, and how the "pause feature work" decision is actually communicated and enforced across a team (e.g., via a Slack announcement, a status page, or blocking merges via CI rules). These organizational mechanics are the natural next layer beyond what's built here. However, the objective trigger—the multi-window burn-rate alerting—is deliberately built as genuine, working infrastructure regardless of team size. It's the human process wrapped around it that would need to scale up for a larger team.
