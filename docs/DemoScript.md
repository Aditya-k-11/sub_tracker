## SubTrack — Live Demo Script

**Setup (before the audience sees anything):**
- Run `node scripts/seed/seed.js` fresh, or `node scripts/seed/resetDemoLiveState.js` if you've already demoed once today
- Ensure the Kubernetes cluster is running.
- The demo now runs by simply visiting `http://localhost:8082` directly (instead of port-forwarding).
- Log out if a previous session is active

**Beat 1 — Login & first impression (⏱ ~30 sec)**
- Log in with demo@subtrack.dev / Demo@1234
- Land on the dashboard — pause here, let the total monthly spend number and charts be visible for a second before narrating
- Say: "This is SubTrack — it pulls every recurring subscription I have into one place and tells me things I wouldn't otherwise notice."

**Beat 2 — Point out the trend chart (⏱ ~20 sec)**
- Say: "This trend line shows my recurring spend creeping up over the last 4 months — that's the kind of thing that's easy to miss a little at a time."

**Beat 3 — The wasted-spend flag, live (⏱ ~40 sec)**
- Scroll to the Wasted-Spend panel — point out Gold's Gym flagged with its reason and cost-per-use
- Say: "I'm not using this — the app noticed and told me, instead of me finding out three months later."
- Click "Log usage" on Gold's Gym right there, submit it — watch it disappear from the flagged list live, with no page reload
- Say: "And the moment I actually use it, it clears itself — this isn't just a static list, it's reacting to real usage."

**Beat 4 — Renewal & trial notifications (⏱ ~30 sec)**
- Click the notification bell — point out the Claude Pro trial-ending alert sitting above the Spotify renewal alert
- Say: "It prioritizes free trials ending over regular renewals, since accidentally converting a trial to paid is the worse outcome."
- Click one notification to mark it read live, then "Mark all read"

**Beat 5 — Add a subscription live (⏱ ~30 sec)**
- Click "Add Subscription", fill in something simple and recognizable (e.g. "YouTube Premium", monthly, ₹149, Entertainment), submit
- Say: "And obviously the core of it — adding, editing, cancelling subscriptions — is a normal, fully working CRUD app underneath all of this."

**Beat 6 — System Notifications (⏱ ~30 sec)**
- Discuss the automatic email notification alerts if services crash or restart (set up in Phase 10/11)

**Beat 7 — Live GitOps deploy (⏱ ~1–2 min, mostly ArgoCD's detection window)**
- Show the ArgoCD UI, currently Synced/Healthy
- Show the current app in a second tab
- Make (or reveal a pre-made, already-committed-but-not-yet-pushed) small change, push it live
- Force a refresh check if the passive wait feels too long for the room: `argocd app get subtrack --refresh`
- Watch ArgoCD go OutOfSync → Synced automatically
- Refresh the app tab, show the change is live
- Closing line: "Every change to this application — features, config, or infrastructure — goes through this exact same path: a Git commit, and ArgoCD takes care of the rest."

*Note: this demo skips the Docker image build/load step for time — in a full CI/CD pipeline (not built for this project's scope), that step would also be automated, triggered by the same git push, rather than run manually beforehand.*

**Total estimated time: ~4–5 minutes for the full end-to-end story.**

### If something goes wrong:
- **If a notification doesn't appear:** check the backend console confirms the cron/manual scan ran; re-trigger via `POST /api/admin/run-renewal-scan` live if needed, framed naturally ("let me just refresh the scan") rather than panicking.
- **If the wasted-spend flag doesn't show:** confirm you haven't accidentally logged usage against Gold's Gym in an earlier rehearsal without resetting — run `resetDemoLiveState.js`.
- **If data looks stale/wrong generally:** full re-seed with `seed.js` is always the safe fallback, just slower.
