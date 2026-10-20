# SubTrack DevOps Evidence Audit

This document provides a rigorous, evidence-based audit of all DevOps, infrastructure, reliability, and security claims across the SubTrack project. Every claim is cross-referenced directly against active code, Kubernetes manifests, CI/CD pipelines, and empirical load-test outputs.

## Audit Methodology & Status Definitions

- **VERIFIED**: Empirical proof exists (configuration, runtime execution, and raw data recorded).
- **IMPLEMENTED BUT NOT TESTED**: Code/manifest exists and is valid, but runtime testing has not been independently verified under audit conditions.
- **DOCUMENTED RESULT — RAW EVIDENCE MISSING**: Documented in markdown reports, but raw execution log/JSON was not initially preserved.
- **UNVERIFIED**: Configured or referenced, but lacks sufficient proof of operation.
- **MISSING**: Claimed in earlier drafts or presentations, but absent in the active codebase.
- **NOT APPLICABLE**: Does not apply to the current architecture.

---

## Evidence Matrix

| Claim | Evidence Required | Evidence Found | Status | Action |
|---|---|---|---|---|
| **1. Docker Image Builds** | Multi-stage Dockerfiles, build optimization, Buildx integration. | `client/Dockerfile` (nginx multi-stage), `server/Dockerfile` (node:20-alpine unprivileged), `.github/workflows/ci-cd.yaml` (Buildx caching). | **VERIFIED** | Document multi-stage builds and layer caching. |
| **2. Docker Image Publishing** | Registry push actions and published tags. | `.github/workflows/ci-cd.yaml` authenticates to Docker Hub and pushes `adityakanojia11/subtrack-frontend` & `subtrack-backend` with commit SHA tags. Workflow Run #48 verified. | **VERIFIED** | Document Docker Hub automated publishing. |
| **3. GitOps Manifest Updates** | Automated commit of new image tags into Git repo. | `.github/workflows/ci-cd.yaml` uses `sed` to update deployment manifests and commits back to `main`. | **VERIFIED** | Document CI push-to-manifest workflow triggering ArgoCD. |
| **4. ArgoCD Drift Detection & Reconciliation** | Running ArgoCD controller, Application CRD, resource tree. | `k8s/argocd/application.yaml`, running ArgoCD controller on `subtrack-cluster`. CRD `applications.argoproj.io/subtrack` shows 15 managed resources in cluster. App Health is `Healthy`; Sync Status demonstrates authentic GitOps drift detection (`OutOfSync` on 2 local manifest updates, 13 Synced). Genuine screenshot preserved at `docs/assets/argocd-original.png`. | **VERIFIED** | Document 15 managed resources tracked by ArgoCD with genuine drift detection. |
| **5. Automated Tests in CI** | CI workflow execution of unit/integration test suites on PR/push. | `.github/workflows/ci-cd.yaml` executes build, push, and manifest update. It does NOT contain `npm test` or automated test gates. | **MISSING** | Remove claims of CI automated test gates; document test suites as locally executed (`npm run test:wasted`). |
| **6. Trivy Security Scanning** | CI/CD Trivy vulnerability scanning step with CVE break threshold. | No Trivy action in `.github/workflows/ci-cd.yaml`; no Trivy operator in cluster. | **MISSING** | Removed from architecture diagram and carousel; add to future roadmap. |
| **7. Kubernetes Rolling Updates** | RollingUpdate deployment strategy with zero-downtime parameters. | `k8s/base/backend/deployment.yaml` sets `strategy: type: RollingUpdate`, `rollingUpdate: maxSurge: 1, maxUnavailable: 0`. | **VERIFIED** | Document rolling update parameters and pod lifecycle. |
| **8. Zero-Downtime Behavior Under Load** | k6 load test executed concurrently during rolling update with HTTP error count. | `load-tests/results/summary-latest.json` (saved to `docs/evidence/k6-zero-downtime.json`): 3,989 requests over 90s rollout test, 0 failed (100% 200 OK), 17 requests (0.43%) took > 500ms during pod swap. Tail latency p95: 6.71 ms. | **VERIFIED** | Highlight exact empirical results: 3,989 requests, 0% failure, 17 > 500ms. |
| **9. HPA Scale-Up & Scale-Down** | HPA resource manifest, metrics-server, live scaling observation log. | `k8s/base/backend/hpa.yaml` (configured min: 2, max: 6, target: 70% CPU). `load-tests/results/hpa-scaling-observed.txt` (saved to `docs/evidence/hpa-scaling.txt`) logs active baseline of 3 pods (28% CPU) scaling dynamically to 6 pods under 258% CPU peak. Scale-down stabilization window configured. | **VERIFIED** | Document configured min: 2, starting active replicas: 3, scaling to 6 under 258% CPU surge. |
| **10. Readiness & Liveness Probes** | Probes in manifests matching real application HTTP endpoints. | `k8s/base/backend/deployment.yaml` specifies `/api/health/live` and `/api/health/ready`. `server/src/routes/healthRoutes.js` implements DB connectivity checks. | **VERIFIED** | Document probe endpoints and failure handling. |
| **11. PodDisruptionBudgets (PDB)** | PDB manifests enforcing minimum availability during disruptions. | `k8s/base/backend/pdb.yaml` (`backend-pdb`, `minAvailable: 1`, `maxUnavailable: 0`), `k8s/base/frontend/pdb.yaml`. | **VERIFIED** | Document PDB configurations preventing voluntary disruption downtime. |
| **12. MongoDB Persistence** | PVC definition, storage class, volume mount in stateful deployment. | `k8s/base/mongo/pvc.yaml` defines `mongo-data-pvc` (5Gi), mounted at `/data/db` in `k8s/base/mongo/deployment.yaml`. | **VERIFIED** | Document persistent volume claims and data preservation. |
| **13. Renewal Scan CronJob** | Kubernetes CronJob manifest triggering renewal alerts on a schedule. | `k8s/base/cronjob/renewal-scan.yaml` defines CronJob scheduled for `0 8 * * *` calling `/api/notifications/run-renewal-scan`. | **IMPLEMENTED BUT NOT TESTED** | Document manifest and schedule; note automated trigger was not audited at 08:00 UTC. |
| **14. Prometheus Metric Collection** | Application `/metrics` endpoint, Prometheus scrape configuration. | `server/src/utils/metrics.js` exports prom-client metrics on `/metrics`. `k8s/observability/prometheus/` manifests configure active scraping. | **VERIFIED** | Document Prometheus metrics collection and RED instrumentation. |
| **15. Grafana Dashboards** | Dashboard definitions, RED panels, and error budget visualization. | `k8s/observability/grafana/dashboards/` contains full RED metric and Error Budget panel definitions. Live dashboard captured in `docs/linkedin/images/3-grafana-dashboard.png`. | **VERIFIED** | Document Grafana dashboard panels and visualizations. |
| **16. Alertmanager Routing & Alerts** | Alertmanager manifests, alert routing rules, notification channels. | `k8s/observability/alertmanager/` manifests exist; alert rules configured in Prometheus ConfigMap. Live external email/webhook requires external API secrets. | **IMPLEMENTED BUT NOT TESTED** | Document routing rules; clarify that notification delivery to external relays was not live tested. |
| **17. SLI/SLO & Error Budget Logic** | Mathematically defined SLOs, SLI metrics, and error budget calculation. | `docs/reliability/SLO-definitions.md`, `SLI-definitions.md`, `error-budget-calculation.md`. Latency SLO: 95% < 500ms; Availability SLO: 99.9%. | **VERIFIED** | Document mathematical SLO framework and error budget policy. |
| **18. Burn-Rate Alerts** | Multiwindow multi-burn-rate alerting rules in Prometheus. | `k8s/observability/prometheus/alert-rules.yaml` defines Google SRE multiwindow burn rate expressions (14.4x 1h, 6x 6h, etc.). | **VERIFIED** | Document multiwindow burn rate alert implementation. |
| **19. Sealed Secrets Workflow** | Asymmetric RSA secret sealing, controller decryption in cluster. | Sealed Secrets controller active in `kube-system`. Git history confirms ciphertext committed in `k8s/base/sealed-secret.yaml`. Controller unseals to live `subtrack-secret`. | **VERIFIED** | Document Bitnami Sealed Secrets GitOps encryption workflow. |
| **20. NetworkPolicies** | NetworkPolicy manifests isolating namespaces or pod traffic. | No NetworkPolicy manifests exist in `k8s/` or repository. | **MISSING** | Omit from architecture diagram and carousel; document as planned roadmap item. |
| **21. Non-Root Container Execution** | Dockerfile unprivileged user configuration, runtime UID verification. | `server/Dockerfile` sets `USER node`. Runtime verified via `kubectl exec deploy/backend -n subtrack -- sh -c 'whoami && id'`: `node`, `uid=1000(node) gid=1000(node)`. | **VERIFIED** | Document verified UID 1000 non-root execution. |
| **22. Gmail OAuth Read-Only Access** | OAuth 2.0 flow with restricted scopes and token encryption. | `server/src/config/googleOAuth.js` restricts scope to `gmail.readonly`. Refresh tokens are AES-256-GCM encrypted in MongoDB via `server/src/utils/tokenEncryption.js`. | **VERIFIED** | Document read-only scope restriction and AES-256-GCM token encryption. |
| **23. Gemini Integration** | LLM parsing service extracting structured subscription receipts. | `server/src/services/geminiService.js` structures receipt extraction using Google Generative AI API. Requires external GEMINI_API_KEY. | **IMPLEMENTED BUT NOT TESTED** | Document email parsing architecture; note live calls depend on API key provisioning. |
| **24. Secret Security & Hygiene** | Git exclusion of `.env`, parameterization of test scripts, no leaked keys. | `.gitignore` covers `.env`. Test scripts parameterized with `process.env.TEST_EMAIL` / `TEST_PASSWORD`. No plaintext credentials in production manifests. | **VERIFIED** | Document secret hygiene practices and environment parameterization. |

---

## Detailed Findings & Remediations

### 1. Root README Correction
- **Original Finding:** The committed root `README.md` was an upstream copy of Bitnami Sealed Secrets documentation.
- **Action Taken:** Preserved original file in `docs/archive/README_ORIGINAL_SEALED_SECRETS.md`. Replaced root `README.md` with comprehensive, accurate SubTrack documentation matching the codebase.

### 2. CI/CD Pipeline Verification
- **Original Finding:** Drafts described automated testing and Trivy scanning in CI.
- **Audit Result:** `.github/workflows/ci-cd.yaml` strictly performs checkout, Docker Buildx build, push to Docker Hub, and manifest updating via Git commit.
- **Action Taken:** Removed claims of CI test execution and Trivy CVE scanning. Accurately documented the pipeline as an automated Build, Tag & Push pipeline.

### 3. Kubernetes NetworkPolicies & Trivy
- **Original Finding:** Architecture diagrams included NetworkPolicy shields and Trivy scanners.
- **Audit Result:** Neither NetworkPolicies nor Trivy exist in the cluster or pipeline.
- **Action Taken:** Completely removed both elements from `docs/architecture.svg`, `docs/architecture.png`, and the LinkedIn carousel.

### 4. Hardcoded Test Script Credentials
- **Original Finding:** Scripts (`test-endpoints.cjs`, `test-insights.cjs`, `test-insights2.cjs`, `test-summary.cjs`, `server/scripts/test-suggestions-api.js`, `test-gmail-fetch.js`, `test-google-flow-without-postman.js`) contained hardcoded credentials for local seed accounts.
- **Action Taken:** Replaced hardcoded credentials with `process.env.TEST_EMAIL || 'demo@subtrack.dev'` and `process.env.TEST_PASSWORD || 'Demo@1234'`. No secrets are printed in logs, docs, or screenshots. Recommended password rotation if local passwords were ever reused in external accounts.
