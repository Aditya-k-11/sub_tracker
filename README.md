# SubTrack

> Cloud-native recurring spend &amp; subscription intelligence platform with automated GitOps delivery, zero-downtime rollouts, and Google SRE multiwindow observability.

[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/Aditya-k-11/sub_tracker/ci-cd.yaml?branch=main&label=CI%2FCD&logo=githubactions&logoColor=white)](https://github.com/Aditya-k-11/sub_tracker/actions)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.32-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps%20v3.4-EF7B4D?logo=argo&logoColor=white)](https://argo-cd.readthedocs.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <img src="docs/architecture.svg" alt="SubTrack Cloud-Native Architecture" width="100%">
</p>

<p align="center">
  <em>Figure 1: Cloud-native system topology — GitOps delivery with ArgoCD, auto-scaled backend runtime on Kubernetes (kind), and Google SRE multiwindow observability.</em>
</p>

---

## Demo & Environment

- **Local Kubernetes Demo:** Tested and verified on a multi-node Kubernetes `kind` cluster with Ingress (`http://subtrack.local` / `http://192.168.1.20.nip.io`).
- **Quickstart Options:** Spin up the stack via [Docker Compose](#option-b-docker-compose) or [Kubernetes with kind + ArgoCD](#option-c-kubernetes-with-kind--argocd).
- **Architecture & Evidence Review:** See the [Architecture Diagram](docs/architecture.svg), [DevOps Evidence Audit](docs/DEVOPS_EVIDENCE_AUDIT.md), and [Visual Carousel Contact Sheet](docs/linkedin/contact-sheet.png).

---

## Table of Contents

- [Why SubTrack Exists](#why-subtrack-exists)
- [Key Features](#key-features)
  - [Product Intelligence](#product-intelligence)
  - [DevOps & Platform Engineering](#devops--platform-engineering)
  - [Security & Secret Management](#security--secret-management)
  - [AI & Automated Ingestion](#ai--automated-ingestion)
- [System Architecture](#system-architecture)
  - [Architecture Walkthrough](#architecture-walkthrough)
- [CI/CD Pipeline & GitOps](#cicd-pipeline--gitops)
- [Request Flow Architecture](#request-flow-architecture)
- [Email Ingestion Architecture](#email-ingestion-architecture)
- [Database Schema (ER Diagram)](#database-schema-er-diagram)
- [Tech Stack](#tech-stack)
- [Reliability Engineering](#reliability-engineering)
  - [Zero-Downtime Rollouts](#zero-downtime-rollouts)
  - [Autoscaling with Horizontal Pod Autoscaler (HPA)](#autoscaling-with-horizontal-pod-autoscaler-hpa)
  - [SLIs, SLOs & Error Budget Policy](#slis-slos--error-budget-policy)
- [Observability & SRE Alerting](#observability--sre-alerting)
- [Security & Secret Management](#security--secret-management-1)
- [Application Walkthrough & Screenshots](#application-walkthrough--screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Option A: Local Development (Node.js + MongoDB)](#option-a-local-development-nodejs--mongodb)
  - [Option B: Docker Compose](#option-b-docker-compose)
  - [Option C: Kubernetes with kind + ArgoCD](#option-c-kubernetes-with-kind--argocd)
- [Environment Variables](#environment-variables)
- [REST API Overview](#rest-api-overview)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Author & Acknowledgments](#author--acknowledgments)
- [License](#license)

---

## Why SubTrack Exists

Modern consumers and businesses suffer from "subscription creep" — unmonitored recurring payments scattered across credit cards, forgotten free trials that convert into paid renewals, and recurring costs for services that sit unused for months. 

SubTrack provides a single, intelligent source of truth that continuously tracks software spend, calculates true cost-per-use, surfaces forgotten recurring charges, and warns users before renewals hit. The platform is designed and operated not as a fragile side project, but as a resilient, observable cloud-native service built with strict Site Reliability Engineering (SRE) principles.

---

## Key Features

### Product Intelligence
- **Lifecycle Tracking:** Track recurring subscriptions across weekly, monthly, and annual billing intervals with real-time status management (`active`, `paused`, `cancelled`).
- **Wasted-Spend Detection:** Automatically flags subscriptions when no usage activity has been recorded beyond configurable thresholds (e.g., 30+ days), calculating exact cost-per-use and clearing flags dynamically upon newly logged activity.
- **Spend Creep Analytics:** Visualizes multi-month spend trajectories and category distributions to highlight subtle cost creep over time.
- **Renewal & Free-Trial Radar:** Priority-ordered notifications alerting users about ending trials before first billing, alongside upcoming renewal countdowns.
- **Annual Savings Calculator:** Highlights potential annual savings by modeling the financial impact of switching eligible monthly subscriptions to yearly commitments.
- **Audit Activity Trail:** Comprehensive audit logging tracking all created, updated, cancelled, or usage-logged operations.
- **Data Portability:** Complete data export to CSV and JSON formats for external accounting.

### DevOps & Platform Engineering
- **Containerized Architecture:** Production multi-stage Docker builds for client and server minimizing container image footprint and vulnerability surface.
- **GitOps Continuous Delivery:** Fully automated deployment reconciliation using ArgoCD, targeting declarative Kubernetes manifests with automatic self-healing and drift detection.
- **Zero-Downtime Rolling Updates:** Kubernetes `RollingUpdate` deployment strategy (`maxSurge: 1`, `maxUnavailable: 0`) coupled with liveness, readiness probes, and `minReadySeconds` ensuring zero dropped requests during live rollouts.
- **High Availability & Fault Tolerance:** PodDisruptionBudgets (`minAvailable: 1`) preventing accidental voluntary disruptions from draining all healthy pods.
- **Horizontal Pod Autoscaling (HPA):** Dynamic scaling of backend pods from 2 to 6 replicas triggered at 70% average CPU utilization, with a 300-second scale-down stabilization window preventing flapping.
- **Nginx Ingress Routing:** Centralized ingress gateway routing both the React SPA (`/`) and REST API (`/api`) under a single domain with TLS termination.
- **Automated CronJobs:** Scheduled Kubernetes `CronJob` (`0 9 * * *`) running daily renewal scans and alert evaluations independently of user traffic.

### Security & Secret Management
- **GitOps-Safe Secrets (Sealed Secrets):** Bitnami Sealed Secrets encrypts sensitive environment credentials into commit-safe `SealedSecret` custom resources using asymmetric cryptography.
- **Non-Root Containers:** Backend services run under an unprivileged `node` user account (`USER node`, UID 1000) inside Alpine containers.
- **Encrypted Token Storage:** Google OAuth 2.0 refresh tokens are AES-256 encrypted at rest before persistence in MongoDB.
- **Security Limitations & Hardening:** Dedicated Kubernetes NetworkPolicies and automated CI container vulnerability scanning (Trivy) are planned enhancements (see [DevOps Evidence Audit](docs/DEVOPS_EVIDENCE_AUDIT.md) and [Roadmap](#roadmap)).

### AI & Automated Ingestion
- **Gmail OAuth Ingestion:** Read-only OAuth 2.0 integration allowing users to connect their Google inbox to discover subscription receipts and invoices.
- **Generative AI Receipt Parsing:** Architectural integration with Google Gemini API to extract merchant identities, recurring amounts, billing cadences, and dates from unstructured email bodies.
- **Confidence Scoring & User Confirmation:** Every detected candidate is graded (`high`, `medium`, `low`) and held in a staging queue for explicit user approval before becoming an active subscription.

---

## System Architecture

The SubTrack platform is structured into five distinct operational zones: **Source & CI**, **GitOps Deployment**, **Kubernetes Cluster**, **External Cloud APIs**, and **Observability & SRE**.

![SubTrack System Architecture](docs/architecture.svg)

> **Fallback Image:** If your renderer does not support animated SVGs, a high-resolution PNG render is available at [`docs/architecture.png`](docs/architecture.png).

### Architecture Walkthrough

```
[Developer] ──(1. Push)──► [GitHub] ──(Webhook)──► [GitHub Actions CI] ──(Build & Tag)──► [Docker Hub]
                                                                                                │
[GitOps Repo: Manifests] ◄──────────────────────────────────────────────────────────────────────┘
           │
           ▼ (2. Auto-Sync)
       [ArgoCD] ◄── [Sealed Secrets] (6. Decrypts runtime secrets)
           │
           ▼ (3. Reconcile)
 ┌───────────────────────── KUBERNETES CLUSTER (Namespace: subtrack) ─────────────────────────┐
 │                                                                                            │
 │   [End User] ──(7. HTTPS)──► [Nginx Ingress Controller]                                    │
 │                                    │              │                                        │
 │                         (Routes /) │              │ (Routes /api)                          │
 │                                    ▼              ▼                                        │
 │                        [Frontend Pods (x2)]   [Backend Pods (x2-6 HPA)] ◄───┐              │
 │                         React 19 + Tailwind     Node.js 20 + Express 5      │ (Daily Scan) │
 │                                                       │                     │              │
 │                                                       ├──► [MongoDB (PVC)]  [CronJob]      │
 │                                                       │    (v7.0)                          │
 └───────────────────────────────────────────────────────┼────────────────────────────────────┘
                                                         │
                               (4. External APIs)        │
                                ┌────────────────────────┴────────────────────────┐
                                ▼                                                 ▼
                     [Google Gemini API]                                [Gmail API (OAuth 2.0)]
                  (LLM Receipt Extraction)                            (Read-Only Receipt Search)
                                │                                                 │
 ┌──────────────────────────────┴───────────────┬─────────────────────────────────┴───────────┐
 │ (5. Telemetry & Alerting)                    ▼                                             │
 │                     ┌──────────────────────────────────────────────────┐                   │
 │                     │    Prometheus Server (Scrapes /metrics)          │                   │
 │                     └────────┬────────────────────────────────┬────────┘                   │
 │                              │                                │                            │
 │                              ▼ (Fire Alerts)                  ▼ (PromQL Queries)           │
 │                     [Alertmanager]                   [Grafana Dashboards]                  │
 │                              │                       (Golden Signals & SLOs)               │
 │                              ▼                                                             │
 │                     [Alert Webhook Logger]                                                 │
 └───────────────────── OBSERVABILITY (Namespace: observability) ─────────────────────────────┘
```

1. **Step 1 (Source & CI):** Developers push code to the `main` branch. GitHub Actions triggers `.github/workflows/ci-cd.yaml` to set up Docker Buildx, build multi-stage images for client and server, tag them with short Git commit SHAs and `latest`, and publish them to Docker Hub. *(Note: automated test gates and Trivy scanning are tracked in [DevOps Evidence Audit](docs/DEVOPS_EVIDENCE_AUDIT.md) as planned CI additions).*
2. **Step 2 (GitOps Sync):** GitHub Actions updates the deployment image tags in `k8s/base/` with `[skip ci]` and pushes back to Git. ArgoCD monitors the repository, detects commit drift, and initiates automated reconciliation.
3. **Step 3 (Cluster Runtime):** Ingress routes public traffic to frontend pods (React 19 served via Nginx) and backend pods (Node.js 20 / Express 5). Pods are protected by PodDisruptionBudgets and dynamically scaled by the Horizontal Pod Autoscaler (HPA). Data persists in MongoDB 7.0 backed by a `PersistentVolumeClaim`. A scheduled Kubernetes `CronJob` runs automated renewal evaluations.
4. **Step 4 (External Intelligence):** The backend queries the read-only Gmail API for billing candidates and invokes the receipt parsing engine to extract merchant names, amounts, and renewal cadences.
5. **Step 5 (Observability Pipeline):** Prometheus scrapes application metrics from backend `/metrics` endpoints and infrastructure metrics from `kube-state-metrics`. Prometheus evaluates Multiwindow Multi-Burn-Rate alert rules, dispatching critical alerts to Alertmanager and streaming dashboards to Grafana.
6. **Step 6 (Security Perimeter):** The Sealed Secrets controller decrypts encrypted secrets directly inside cluster memory without storing plaintext in Git. Backend containers run under unprivileged user `node` (UID 1000). *(Declarative NetworkPolicies are documented in the [Roadmap](#roadmap)).*
7. **Step 7 (End-User Access):** End users access the platform via HTTPS through the Nginx Ingress gateway.

---

## CI/CD Pipeline & GitOps

The deployment workflow is fully automated from commit to production rollout using GitOps principles.

```mermaid
flowchart TD
    A([fa:fa-code Developer Pushes Code]) --> B[GitHub Repository: main branch]
    B --> C{GitHub Actions CI Triggered<br/>ci-cd.yaml}
    C --> D[Docker Buildx Setup & Cache]
    D --> E[Build Multi-Stage Docker Images<br/>client/Dockerfile & server/Dockerfile]
    E --> F[Tag with Short Git SHA & latest]
    F --> G[Push Images to Docker Hub Container Registry]
    G --> H[Update Image Tags in k8s/base/ Deployments]
    H --> I[Commit & Push [skip ci] to main]
    I --> J[ArgoCD GitOps Auto-Sync Detects Manifest Drift]
    J --> K[ArgoCD Reconciles & Self-Heals to Cluster]
    K --> L[Zero-Downtime RollingUpdate Rollout<br/>maxSurge: 1, maxUnavailable: 0]
    L --> M([✅ Healthy New Replicas Serving Traffic])

    classDef success fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
    classDef process fill:#1e1b4b,stroke:#6366f1,stroke-width:1.5px,color:#e0e7ff;
    classDef trigger fill:#312e81,stroke:#818cf8,stroke-width:1.5px,color:#e0e7ff;

    class M success;
    class D,E,F,G,H,I,J,K,L process;
    class C trigger;
```

### Pipeline Stages Explained
1. **Developer Push:** Changes pushed to `client/`, `server/`, or `.github/workflows/` trigger `.github/workflows/ci-cd.yaml`.
2. **Container Image Build:** Docker Buildx builds production multi-stage images for frontend (Nginx SPA) and backend (Node.js runtime).
3. **Registry Publishing:** Tags images with the Git commit short SHA (`adityakanojia11/subtrack-*:sha_short`) and `latest`, then pushes to Docker Hub. (Workflow Run #48 completed clean in 1m 6s).
4. **GitOps Manifest Update:** CI uses `sed` to update the deployment image tags in `k8s/base/frontend/deployment.yaml` and `k8s/base/backend/deployment.yaml`, committing the change back to `main` with `[skip ci]`.
5. **ArgoCD Reconciliation:** ArgoCD monitors the Git repository. Upon detecting commit drift, it initiates automated synchronization, applying kustomized manifests to the cluster with self-healing enabled (15/15 resources Synced & Healthy).
6. **Rolling Update Execution:** Kubernetes executes a zero-downtime rolling update (`maxSurge: 1`, `maxUnavailable: 0`), verifying readiness before traffic cutover.

> [!NOTE]
> **Pipeline Reality Note:** The active pipeline `.github/workflows/ci-cd.yaml` automates image build, tagging, push, and GitOps manifest patching. It does not currently contain automated test execution or Trivy vulnerability scanning stages; these are tracked in the [DevOps Evidence Audit](docs/DEVOPS_EVIDENCE_AUDIT.md) and [Roadmap](#roadmap).

---

## Request Flow Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as End User (Browser)
    participant Ingress as Nginx Ingress Controller
    participant Frontend as Frontend Pod (Nginx + React SPA)
    participant Backend as Backend Pod (Express REST API)
    participant DB as MongoDB (Persistent Volume)

    User->>Ingress: HTTPS Request (subtrack.local / 192.168.1.20.nip.io)
    alt Static Asset Route (/)
        Ingress->>Frontend: Route request to frontend service (port 80)
        Frontend-->>User: Return HTML / JS Bundle / CSS assets
    else API Data Route (/api/*)
        Ingress->>Backend: Route request to backend service (port 5000)
        Note over Backend: Authenticate JWT / Rate Limiting / Metrics Middleware
        Backend->>DB: Query Mongoose Model (e.g. Subscription.find)
        DB-->>Backend: Return Document / Result Cursor
        Backend-->>User: Return JSON Response ({ status: 'success', data })
    end
```

---

## Email Ingestion Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as React Client
    participant Backend as Express Backend
    participant Gmail as Google Gmail API (OAuth 2.0)
    participant Gemini as Google Gemini AI API
    participant DB as MongoDB

    User->>Frontend: Connect Gmail (OAuth 2.0 Consent)
    Frontend->>Backend: Initiate OAuth Flow (/api/auth/google/connect)
    Backend-->>User: Redirect to Google Accounts Consent Screen
    User->>Backend: Google Callback with Auth Code (/api/auth/google/callback)
    Backend->>Gmail: Exchange Code for Refresh Token
    Gmail-->>Backend: Return Refresh Token (read-only scopes)
    Note over Backend: AES-256 Encrypt & Save Token to User document
    Backend->>DB: Save encrypted googleRefreshToken & gmailConnected: true

    User->>Frontend: Click "Scan Emails for Subscriptions"
    Frontend->>Backend: POST /api/suggestions/scan
    Backend->>Gmail: Search candidate emails (query: receipt OR invoice OR subscription)
    Gmail-->>Backend: Return email message list & snippets
    Backend->>Gmail: Fetch full email payload (MIME text/html)
    Gmail-->>Backend: Return decoded email contents
    Backend->>Gemini: Send prompt with raw email body for entity extraction
    Gemini-->>Backend: Structured JSON (serviceName, cost, cycle, confidence)
    Backend->>DB: Upsert SuggestedSubscription records (status: 'pending')
    Backend-->>Frontend: Return found suggestions list

    User->>Frontend: Review suggestions & Click "Confirm"
    Frontend->>Backend: PATCH /api/suggestions/:id/confirm
    Backend->>DB: Create active Subscription & Update suggestion to 'confirmed'
    Backend->>DB: Record ActivityLog (suggestion_confirmed)
    Backend-->>Frontend: Confirmation Success (Dashboard updated)
```

---

## Database Schema (ER Diagram)

SubTrack uses MongoDB with Mongoose object modeling. The schema reflects the seven primary collections that exist in the codebase:

```mermaid
erDiagram
    USER ||--o{ SUBSCRIPTION : "owns"
    USER ||--o{ SUGGESTED_SUBSCRIPTION : "receives"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ ACTIVITY_LOG : "triggers"
    USER ||--o{ SPEND_SNAPSHOT : "tracks"
    SUBSCRIPTION ||--o{ USAGE_LOG : "has"
    SUBSCRIPTION ||--o{ NOTIFICATION : "generates"
    SUBSCRIPTION ||--o{ ACTIVITY_LOG : "referenced_in"
    SUGGESTED_SUBSCRIPTION |o--o| SUBSCRIPTION : "confirms_to"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string currency
        number monthlyBudget
        boolean hasCompletedOnboarding
        string googleRefreshToken
        boolean gmailConnected
        date gmailConnectedAt
        date lastEmailScanAt
        array connectedEmailAccounts
        object notificationPreferences
        date createdAt
    }

    SUBSCRIPTION {
        ObjectId _id PK
        ObjectId userId FK
        string name
        number cost
        string currency
        string billingCycle
        number billingCycleInterval
        string category
        date nextRenewalDate
        string status
        boolean isTrial
        date trialEndDate
        string paymentMethod
        string notes
        number sharedWithCount
        string sharedNote
        array costHistory
        date createdAt
        date cancelledAt
    }

    SUGGESTED_SUBSCRIPTION {
        ObjectId _id PK
        ObjectId userId FK
        string suggestedName
        string suggestedCategory
        number suggestedCost
        string suggestedBillingCycle
        string confidence
        string sourceSubject
        string sourceSender
        date sourceDate
        string sourceMessageId
        string status
        ObjectId confirmedSubscriptionId FK
        date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId subscriptionId FK
        string type
        string message
        string priority
        boolean isRead
        date sentAt
    }

    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId userId FK
        string action
        ObjectId subscriptionId FK
        string subscriptionName
        object metadata
        date createdAt
    }

    SPEND_SNAPSHOT {
        ObjectId _id PK
        ObjectId userId FK
        string month
        number totalSpend
        object totalByCategory
        date createdAt
    }

    USAGE_LOG {
        ObjectId _id PK
        ObjectId subscriptionId FK
        date usedAt
        string note
    }
```

---

## Tech Stack

| Technology | Logo | Category | Why It Was Chosen |
| :--- | :---: | :--- | :--- |
| **React 19** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) | Frontend Framework | Fast component composition, declarative state management, and modern concurrent features for rich dashboard analytics. |
| **Tailwind CSS** | ![Tailwind](https://img.shields.io/badge/-Tailwind-06B6D4?logo=tailwindcss&logoColor=white) | Styling | Utility-first CSS providing cohesive dark-mode design tokens and rapid UI iterations without bloated style sheets. |
| **Node.js 20 LTS** | ![NodeJS](https://img.shields.io/badge/-Node.js-5FA04E?logo=nodedotjs&logoColor=white) | Backend Runtime | High-throughput asynchronous I/O optimized for handling concurrent REST traffic, OAuth token handshakes, and cron batch tasks. |
| **Express 5** | ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | API Framework | Minimalist routing engine supporting robust middleware pipelines (validation, error handling, Prometheus metrics). |
| **MongoDB 7.0** | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) | Database | Flexible document model accommodating varying subscription pricing histories, JSON metadata, and OAuth tokens. |
| **Docker** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) | Containerization | Standardized immutable build artifacts separating development and production runtimes via multi-stage builds. |
| **Kubernetes (kind)** | ![K8s](https://img.shields.io/badge/-Kubernetes-326CE5?logo=kubernetes&logoColor=white) | Orchestration | Declarative cluster orchestration managing rollouts, service discovery, persistent volumes, and pod autoscaling. |
| **ArgoCD** | ![ArgoCD](https://img.shields.io/badge/-ArgoCD-EF7B4D?logo=argo&logoColor=white) | GitOps Continuous Delivery | Declarative synchronization maintaining cluster convergence against the Git repository with automated drift self-healing. |
| **GitHub Actions** | ![GHA](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=githubactions&logoColor=white) | CI/CD Automation | Container image build, tagging with short Git commit SHA, and GitOps manifest deployment tag patching on push. |
| **Trivy (Planned)** | ![Trivy](https://img.shields.io/badge/-Trivy-4B68FF?logo=trivy&logoColor=white) | Security Scanning (Roadmap) | Container security scanner for base image and dependency CVE auditing (tracked as planned CI gate in [DevOps Evidence Audit](docs/DEVOPS_EVIDENCE_AUDIT.md)). |
| **Prometheus** | ![Prometheus](https://img.shields.io/badge/-Prometheus-E6522C?logo=prometheus&logoColor=white) | Telemetry & Alerting | Time-series metrics collection via `/metrics` endpoint with native PromQL evaluation of multiwindow SLO burn rates. |
| **Grafana** | ![Grafana](https://img.shields.io/badge/-Grafana-F46800?logo=grafana&logoColor=white) | Observability UI | Real-time visualization of SRE Golden Signals, error budget burn rates, HPA replica states, and traffic patterns. |
| **Alertmanager** | ![Alertmanager](https://img.shields.io/badge/-Alertmanager-E6522C?logo=prometheus&logoColor=white) | Alert Management | Deduplication, grouping, and dispatching of fast-burn and slow-burn alerts to webhooks and notification endpoints. |
| **Bitnami Sealed Secrets** | ![SealedSecrets](https://img.shields.io/badge/-Sealed_Secrets-10B981?logo=kubernetes&logoColor=white) | Secret Management | Asymmetric public-key encryption enabling secure storage of Kubernetes secrets inside public Git repositories. |
| **Nginx** | ![Nginx](https://img.shields.io/badge/-NGINX-009639?logo=nginx&logoColor=white) | Ingress & Static Proxy | High-performance reverse proxying, TLS termination, and static asset delivery with client-side SPA routing fallbacks. |
| **Google Gemini API** | ![Gemini](https://img.shields.io/badge/-Google_Gemini-8E75B2?logo=googlegemini&logoColor=white) | Artificial Intelligence | Structured information extraction from complex unstructured email bodies to detect merchant names and billing cycles. |
| **Gmail API** | ![Gmail](https://img.shields.io/badge/-Gmail_API-EA4335?logo=gmail&logoColor=white) | OAuth Email Service | Read-only access to user email receipts via scoped OAuth 2.0 without exposing user mailbox credentials. |

---

## Reliability Engineering

SubTrack was built to demonstrate operational rigor and production survivability.

### Zero-Downtime Rollouts
Live deployments must never compromise service availability. We achieve zero dropped requests through four cooperating mechanisms:

1. **Deployment Strategy:** Configured with `type: RollingUpdate`, `maxSurge: 1`, and `maxUnavailable: 0` in both [`k8s/base/backend/deployment.yaml`](k8s/base/backend/deployment.yaml) and [`k8s/base/frontend/deployment.yaml`](k8s/base/frontend/deployment.yaml). New pods must become fully ready before old pods begin termination.
2. **Probes & Readiness Guardrails:** 
   - Backend Readiness Probe: `GET /api/health/ready` validates MongoDB connection state before the pod accepts incoming traffic.
   - Backend Liveness Probe: `GET /api/health/live` monitors Node.js process responsiveness.
   - `minReadySeconds: 10`: Guarantees new pods remain healthy for at least 10 seconds before Kubernetes marks the rollout step complete.
3. **PodDisruptionBudgets (PDB):** Defined in [`k8s/base/backend/pdb.yaml`](k8s/base/backend/pdb.yaml) and [`k8s/base/frontend/pdb.yaml`](k8s/base/frontend/pdb.yaml) with `minAvailable: 1`, preventing cluster maintenance from draining all instances simultaneously.
4. **Observed Load-Test Verification:**
   - **Load Profile:** 10 Virtual Users (VUs) sustaining continuous requests for 90 seconds while a rolling update was executed across the cluster.
   - **Empirical Verification Result:** **3,989 total HTTP requests** processed with **0 failed requests** (100% 200 OK availability). Tail latency p95 was **6.71 ms**, with only 17 requests (0.43%) taking >500 ms during pod swap-over. Raw output preserved in [`docs/evidence/k6-zero-downtime.json`](docs/evidence/k6-zero-downtime.json).

### Autoscaling with Horizontal Pod Autoscaler (HPA)
Traffic surges dynamically trigger horizontal pod scaling to preserve responsiveness without manual operator intervention:

1. **HPA Resource Target:** Configured in [`k8s/base/backend/hpa.yaml`](k8s/base/backend/hpa.yaml) targeting `averageUtilization: 70%` CPU across pods, with a minimum of 2 replicas and a ceiling of 6 replicas.
2. **Stabilization & Cooldown Windows:**
   - `scaleUp.stabilizationWindowSeconds: 30`: Ramps up capacity within 30–60 seconds of sustained load.
   - `scaleDown.stabilizationWindowSeconds: 300`: Holds scaled replicas for 5 minutes after traffic normalizes, preventing pod flapping during intermittent lulls.
3. **Observed Scaling Verification:**
   - **Load Profile:** Staged k6 load ramping to 50 VUs against `/api/analytics/categories`.
   - **Empirical Scaling Result:** Baseline 3 pods scaled dynamically to **6 replicas** as CPU utilization peaked at **258%** (against the 70% target). The 300-second scale-down stabilization window held capacity before consolidating back. Raw watch log preserved in [`docs/evidence/hpa-scaling.txt`](docs/evidence/hpa-scaling.txt).

### SLIs, SLOs & Error Budget Policy

Formal reliability guarantees are defined in our dedicated reliability documentation:
- [SLI Definitions](docs/reliability/SLI-definitions.md)
- [SLO Definitions](docs/reliability/SLO-definitions.md)
- [Error Budget Calculation](docs/reliability/error-budget-calculation.md)
- [Error Budget Policy](docs/reliability/error-budget-policy.md)

#### Service Level Objectives (SLOs)
| Objective | Target | Rolling Window | SLI PromQL Metric |
| :--- | :--- | :--- | :--- |
| **SLO #1 — Availability** | **99.9%** (Allowed failure: 0.1%) | 30 Days | `sum(rate(subtrack_http_requests_total{status_code!~"5.."}[30d])) / sum(rate(subtrack_http_requests_total[30d]))` |
| **SLO #2 — Latency** | **95.0% < 500ms** (Allowed slow: 5.0%) | 30 Days | `sum(rate(subtrack_http_request_duration_seconds_bucket{le="0.5"}[30d])) / sum(rate(subtrack_http_request_duration_seconds_count[30d]))` |

#### Multiwindow Multi-Burn-Rate Alerting
Rather than alerting on simplistic instantaneous thresholds (which generate noisy false positives) or 30-day averages (which alert too late), Prometheus evaluates Google SRE Multiwindow Burn-Rate alert rules defined in [`k8s/observability/prometheus-rules-configmap.yaml`](k8s/observability/prometheus-rules-configmap.yaml):

```promql
# Availability Fast Burn Alert: 14.4x burn rate over both 5m and 1h windows
(
  (1 - (sum(rate(subtrack_http_requests_total{status_code!~"5.."}[5m])) / sum(rate(subtrack_http_requests_total[5m])))) / 0.001 > 14.4
)
and
(
  (1 - (sum(rate(subtrack_http_requests_total{status_code!~"5.."}[1h])) / sum(rate(subtrack_http_requests_total[1h])))) / 0.001 > 14.4
)
```

- **Fast Burn Alert (14.4x Rate):** Fires critical alerts within 2 minutes if the error budget is on track to exhaust completely in ~2 days.
- **Slow Burn Alert (3x Rate):** Fires warning alerts within 15 minutes if steady budget depletion is on track to exhaust within ~10 days.

#### Three-Tier Error Budget Policy
1. **Tier 1 (Healthy, <50% consumed):** Normal feature engineering continues.
2. **Tier 2 (Warning, 50–100% consumed or Slow Burn active):** Risky infrastructure migrations deferred; PRs require reliability impact review.
3. **Tier 3 (Exhausted, ≥100% consumed or Fast Burn active):** All new feature releases halt immediately. Engineering effort redirects entirely to root-cause mitigation until alerts clear.

---

## Observability & SRE Alerting

SubTrack operates a dedicated observability stack under the `observability` namespace:

- **Prometheus Server:** Scrapes `/metrics` from backend instances every 15 seconds using `prom-client` histogram collectors.
- **Kube-State-Metrics:** Emits pod health, replica counts, deployment statuses, and persistent volume telemetry.
- **Alertmanager:** Deduplicates and dispatches SRE burn-rate alerts to the internal audit logger and notification handlers.
- **Grafana Dashboards:** Pre-configured with custom dashboards visualizing:
  - **SRE Golden Signals:** Request rate (QPS), error rate (5xx), latency percentiles (p50, p90, p95, p99), and CPU saturation.
  - **Error Budget Gauges:** Real-time percentage of availability and latency budgets remaining.
  - **HPA Scaling Dynamics:** Target CPU utilization vs. real-time pod replica scaling.

- **Grafana Dashboard Preview:**

![Grafana RED Dashboard & Error Budget Gauges](docs/linkedin/images/3-grafana-dashboard.png)

---

## Security & Secret Management

- **Bitnami Sealed Secrets:** Secrets are encrypted client-side using `kubeseal` and the cluster public certificate ([`k8s/base/sealed-secrets-public-cert.pem`](k8s/base/sealed-secrets-public-cert.pem)). The resulting `SealedSecret` custom resources can be safely checked into version control; only the controller running in the cluster possesses the private decryption key.
- **Least-Privilege Execution:** The Node.js application process runs as unprivileged user `node` (UID/GID 1000) inside container boundaries, mitigating container breakout risks.
- **Network Isolation:** Network traffic isolation is managed via Kubernetes ClusterIP Service abstraction and Ingress routing rules. Dedicated default-deny `NetworkPolicy` resources are documented as a planned enhancement in the [Roadmap](#roadmap).
- **Cryptographic At-Rest Token Protection:** User Google OAuth refresh tokens are encrypted using `crypto.createCipheriv('aes-256-cbc', key, iv)` before writing to MongoDB. Plaintext tokens never appear in database storage.
- **Vulnerability Auditing:** Minimal Alpine container bases minimize the attack surface; automated Trivy scanning in CI is documented in the [Roadmap](#roadmap).

---

## Application Walkthrough & Screenshots

### 1. Subscription Intelligence Dashboard
Live dashboard displaying active recurring spend, upcoming renewals, and wasted-spend alerts:
![SubTrack Analytics Dashboard](docs/linkedin/images/1-app-dashboard.png)

### 2. GitOps Continuous Delivery (ArgoCD)
Automated cluster convergence and drift detection across 15 Kubernetes resources:
![ArgoCD GitOps Reconciliation](docs/linkedin/images/2-argocd-original-clean.png)

### 3. Kubernetes Security & Non-Root Proof
Terminal verification confirming UID 1000 non-root execution and Bitnami Sealed Secrets ciphertext:
![Kubernetes Security Proof](docs/linkedin/images/8-security-proof.png)

---

## Project Structure

```
subtrack/
├── .github/
│   └── workflows/
│       └── ci-cd.yaml             # Automated CI pipeline: build, test, push, manifest patch
├── client/                        # React 19 Single Page Application
│   ├── src/
│   │   ├── components/            # Modular dashboard, subscription, and layout widgets
│   │   ├── pages/                 # Route views (Dashboard, Subscriptions, Reports, Profile)
│   │   ├── context/               # Authentication & theme context providers
│   │   ├── services/              # Axios API client connectors
│   │   └── index.css              # Tailwind CSS configuration and base tokens
│   ├── nginx.conf                 # Production Nginx reverse-proxy & client routing config
│   ├── Dockerfile                 # Multi-stage Docker build (Node.js build -> Nginx release)
│   └── package.json               # Client dependencies (React, Recharts, Lucide, Tailwind)
├── server/                        # Node.js Express REST API
│   ├── src/
│   │   ├── config/                # Database, OAuth, and Prom-client metrics configuration
│   │   ├── controllers/           # API controllers (auth, subscriptions, analytics, admin)
│   │   ├── middleware/            # JWT protect, validator, and Prometheus metrics middleware
│   │   ├── models/                # Mongoose schemas (User, Subscription, UsageLog, etc.)
│   │   ├── routes/                # Express router declarations
│   │   ├── services/              # Insights engine, Gmail service, renewal scanner
│   │   └── utils/                 # Currency conversion, token encryption, date helpers
│   ├── Dockerfile                 # Multi-stage Docker build running as non-root 'node'
│   └── package.json               # Server dependencies (Express, Mongoose, Googleapis, Winston)
├── k8s/                           # Declarative Kubernetes Manifests (Kustomize)
│   ├── base/                      # Core SubTrack application resources
│   │   ├── backend/               # Deployment, HPA, PDB, Service, CronJob, Logs PVC
│   │   ├── frontend/              # Deployment, PDB, Service
│   │   ├── mongo/                 # Deployment, PersistentVolumeClaim, Service
│   │   ├── ingress/               # Ingress routing rules & TLS configuration
│   │   ├── sealed-secret.yaml     # Asymmetrically encrypted production credentials
│   │   └── kustomization.yaml     # Base Kustomize resource composition
│   ├── argocd/                    # ArgoCD application declarations & notification hooks
│   ├── observability/             # Prometheus, Alertmanager, Grafana, and KSM manifests
│   └── kind-config.yaml           # Local multi-port kind cluster configuration
├── load-tests/                    # k6 performance and reliability test suite
│   ├── zero-downtime-check.js     # Rollout traffic test validating 0 dropped requests
│   ├── hpa-scaling-test.js        # Staged load script verifying HPA scaling to 6 pods
│   └── hpa-test-results.md        # Documented observations and test evidence
├── scripts/                       # Database seeding, diagram generation, and utilities
│   ├── generate-architecture-diagram.js # Compiles architecture SVG & renders PNG fallback
│   └── seed/seed.js               # Populates realistic demo subscriptions and usage history
├── docs/                          # Architectural and operational documentation
│   ├── architecture.svg           # High-resolution animated vector architecture diagram
│   ├── architecture.png           # Fallback pixel-rendered architecture image
│   ├── DemoScript.md              # 5-minute live demonstration script for presentations
│   └── reliability/               # Formal SRE SLI/SLO definitions and error budget policy
├── docker-compose.yml             # Single-command local containerized stack
├── README_TODO.md                 # Security findings, codebase audit items & action checklist
└── package.json                   # Root monorepo workspace configuration
```

---

## Getting Started

You can run SubTrack using any of three verified workflows:

### Option A: Local Development (Node.js + MongoDB)
Best for rapid code editing and component development.

**Prerequisites:** Node.js v18+, npm, and MongoDB running locally on port `27017`.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya-k-11/sub_tracker.git
   cd sub_tracker
   ```
2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local MongoDB URI and development secrets
   ```
3. **Install dependencies and start backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. **In a second terminal, start frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
5. **Seed demo data (in a third terminal):**
   ```bash
   npm run seed
   ```
6. **Open browser:** Visit `http://localhost:5173` (Login with `demo@subtrack.dev` / `Demo@1234`).

---

### Option B: Docker Compose
Best for full-stack integration testing without installing Kubernetes.

**Prerequisites:** Docker Engine v24+ and Docker Compose.

1. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
2. **Build and launch containers:**
   ```bash
   docker compose up --build -d
   ```
3. **Verify running services:**
   ```bash
   docker compose ps
   ```
4. **Seed demo data:**
   ```bash
   docker compose exec backend node ../scripts/seed/seed.js
   ```
5. **Access SubTrack:** Open `http://localhost:8080`.

---

### Option C: Kubernetes with kind + ArgoCD
Best for testing GitOps, autoscaling, and zero-downtime rollouts in a production-like cluster.

**Prerequisites:** Docker, `kubectl`, `kind` (v0.27+), `kubeseal`, and `argocd` CLI.

1. **Create the kind cluster with port mappings:**
   ```bash
   kind create cluster --config k8s/kind-config.yaml --name subtrack
   ```
2. **Install Nginx Ingress Controller:**
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
   kubectl wait --namespace ingress-nginx \
     --for=condition=ready pod \
     --selector=app.kubernetes.io/component=controller \
     --timeout=120s
   ```
3. **Install Bitnami Sealed Secrets Controller:**
   ```bash
   kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.5/sealed-secrets-controller.yaml
   kubectl rollout status deployment sealed-secrets-controller -n kube-system
   ```
4. **Install ArgoCD:**
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   kubectl rollout status deployment argocd-server -n argocd
   ```
5. **Deploy the SubTrack Application via ArgoCD:**
   ```bash
   kubectl apply -f k8s/subtrack-app.yaml
   ```
6. **Deploy the Observability Stack (Prometheus, Alertmanager, Grafana):**
   ```bash
   kubectl apply -k k8s/observability
   ```
7. **Access the Platform:**
   - **SubTrack App:** Visit `http://localhost:8082` (or map `192.168.1.20.nip.io` in `/etc/hosts`).
   - **ArgoCD UI:** Run `argocd admin dashboard -n argocd --port 8999` and navigate to `http://localhost:8999`.
   - **Grafana:** Run `kubectl port-forward svc/grafana -n observability 3001:3000` and navigate to `http://localhost:3001` (Credentials: `admin` / `admin`).

---

## Environment Variables

| Variable | Description | Required | Default / Example Value |
| :--- | :--- | :---: | :--- |
| `PORT` | HTTP port on which the Express server listens | No | `5000` |
| `NODE_ENV` | Application runtime environment (`development` \| `production`) | **Yes** | `production` |
| `MONGO_URI` | MongoDB connection connection string with authentication | **Yes** | `mongodb://subtrack_admin:password@mongo:27017/subtrack?authSource=admin` |
| `MONGO_ROOT_USERNAME` | Root database administrator username | **Yes** | `subtrack_admin` |
| `MONGO_ROOT_PASSWORD` | Root database administrator password | **Yes** | `your_secure_password` |
| `MONGO_DB_NAME` | Default database schema name | **Yes** | `subtrack` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | **Yes** | `your_64_character_random_hex_string` |
| `JWT_EXPIRES_IN` | Token expiration time window | No | `7d` |
| `TOKEN_ENCRYPTION_KEY` | 32-byte hex key for AES-256 encryption of OAuth tokens at rest | **Yes** | `your_32_byte_hex_key` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console | **Yes** | `xxxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret from Google Cloud Console | **Yes** | `GOCSPX-xxxxxx` |
| `GOOGLE_REDIRECT_URI` | Authorized OAuth 2.0 redirect callback URL | **Yes** | `http://localhost:5000/api/auth/google/callback` |
| `FRONTEND_URL` | Public origin of the React frontend application | **Yes** | `http://localhost:8082` |
| `ENABLE_LOCAL_CRON` | Enables in-process `node-cron` (set to `false` when using k8s CronJob) | No | `true` |
| `VITE_API_BASE_URL` | Base API prefix baked into client bundle at build time | No | `/api` |

---

## REST API Overview

### Health & Telemetry
| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/metrics` | No | Prometheus metrics scrape endpoint (prom-client) |
| `GET` | `/api/health` | No | Basic server uptime and MongoDB connection state |
| `GET` | `/api/health/live` | No | Kubernetes liveness probe (validates event loop responsiveness) |
| `GET` | `/api/health/ready` | No | Kubernetes readiness probe (validates DB connectivity before routing) |
| `GET` | `/api/health/slow` | No | Synthetic 1000ms delayed endpoint for latency SLI testing |

### Authentication & Account
| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Register new user account with bcrypt password hashing |
| `POST` | `/api/auth/login` | No | Authenticate user and issue signed JWT bearer token |
| `GET` | `/api/users/me` | **JWT** | Fetch authenticated user profile & notification preferences |
| `PATCH` | `/api/users/me` | **JWT** | Update profile information (name, preferred currency) |
| `POST` | `/api/users/me/change-password` | **JWT** | Change user password |
| `PATCH` | `/api/users/me/notification-preferences` | **JWT** | Update alert preferences (renewals, trials, wasted spend) |
| `PATCH` | `/api/users/me/complete-onboarding` | **JWT** | Mark onboarding wizard as completed |
| `PATCH` | `/api/users/me/budget` | **JWT** | Set or update monthly software spending budget |
| `DELETE` | `/api/users/me` | **JWT** | Delete user account and cascade delete all user records |

### Subscriptions & Usage
| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/subscriptions` | **JWT** | List user subscriptions (supports filtering by status, category, cycle) |
| `POST` | `/api/subscriptions` | **JWT** | Create a new tracked subscription |
| `PATCH` | `/api/subscriptions/bulk` | **JWT** | Bulk update status or category across multiple subscriptions |
| `GET` | `/api/subscriptions/:id` | **JWT** | Retrieve single subscription record |
| `PATCH` | `/api/subscriptions/:id` | **JWT** | Update subscription cost, billing interval, or metadata |
| `DELETE` | `/api/subscriptions/:id` | **JWT** | Cancel or delete a subscription |
| `GET` | `/api/subscriptions/:id/detail` | **JWT** | Fetch comprehensive subscription detail, usage stats, and price changes |
| `PATCH` | `/api/subscriptions/:id/notes` | **JWT** | Update custom user notes for a subscription |
| `POST` | `/api/subscriptions/:id/usage` | **JWT** | Log active usage event (clears wasted-spend flags) |
| `GET` | `/api/subscriptions/:id/usage` | **JWT** | Fetch usage history for a subscription |
| `GET` | `/api/subscriptions/:id/usage/summary` | **JWT** | Fetch aggregate usage statistics (days since last use, total count) |
| `DELETE` | `/api/subscriptions/:id/usage/:usageId` | **JWT** | Delete a specific usage log entry |
| `GET` | `/api/subscriptions/:id/savings-estimate` | **JWT** | Calculate estimated savings from switching to an annual billing cycle |

### Analytics & Intelligence
| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/analytics/summary` | **JWT** | Total monthly spend, active subscriptions count, and budget pacing |
| `GET` | `/api/analytics/categories` | **JWT** | Category breakdown with spend percentages and counts |
| `GET` | `/api/analytics/trend` | **JWT** | Historical 4-month spend progression |
| `GET` | `/api/analytics/wasted` | **JWT** | Flagged unused subscriptions with calculated cost-per-use |
| `GET` | `/api/analytics/upcoming-timeline` | **JWT** | Chronological timeline of upcoming renewals over the next 30 days |
| `GET` | `/api/analytics/velocity` | **JWT** | Current spend velocity compared to baseline monthly averages |
| `GET` | `/api/analytics/insights` | **JWT** | Prioritized financial insights (trial endings, price hikes, overlaps) |
| `GET` | `/api/analytics/category/:category` | **JWT** | Deep-dive metrics and subscription list for a specific category |

### Gmail Ingestion & AI Suggestions
| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/auth/google/connect` | **JWT** | Generate Google OAuth 2.0 consent URL for Gmail read access |
| `GET` | `/api/auth/google/callback` | No | Handle OAuth callback, exchange auth code, and store encrypted token |
| `POST` | `/api/auth/google/disconnect` | **JWT** | Disconnect Gmail integration and delete encrypted tokens |
| `GET` | `/api/auth/google/status` | **JWT** | Check connection status, connected email, and last scan timestamp |
| `POST` | `/api/suggestions/scan` | **JWT** | Trigger Gmail inbox scan for subscription receipt candidates |
| `GET` | `/api/suggestions` | **JWT** | Retrieve pending suggested subscriptions |
| `PATCH` | `/api/suggestions/:id/confirm` | **JWT** | Convert suggestion into an active tracked subscription |
| `PATCH` | `/api/suggestions/:id/dismiss` | **JWT** | Dismiss a false-positive suggestion |

### Notifications & Audit
| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/notifications` | **JWT** | Fetch renewal and trial alerts ordered by priority |
| `PATCH` | `/api/notifications/:id/read` | **JWT** | Mark a specific notification as read |
| `PATCH` | `/api/notifications/read-all` | **JWT** | Mark all active notifications as read |
| `GET` | `/api/activity/recent` | **JWT** | Get stream of recent user activity |
| `GET` | `/api/activity/history` | **JWT** | Paginated audit log of all account operations |
| `GET` | `/api/export/subscriptions` | **JWT** | Export subscription dataset in CSV or JSON format |
| `POST` | `/api/admin/run-renewal-scan` | **JWT** | Manually trigger renewal check and notification generation |
| `POST` | `/api/admin/run-email-scan` | **JWT** | Manually trigger email receipt scanner batch |

---

## Known Limitations

- **Local Kubernetes Validation:** The GitOps and Kubernetes configurations were engineered and validated on a local multi-node `kind` cluster. Production deployment to managed cloud providers (AWS EKS, GCP GKE, Azure AKS) would require external Ingress controllers (e.g. AWS Load Balancer Controller) and managed volume provisioners (EBS CSI).
- **Gemini AI API Binding:** The receipt extraction pipeline is architected for Google Gemini API structured extraction. The current codebase uses a catalog of known services (`knownServicesCatalog.js`) combined with regex amount extraction as an intermediate heuristic. Native Gemini API client SDK calls are planned on the roadmap.
- **NetworkPolicy Enforcement:** The architectural security model documents pod-to-pod network restriction boundaries, but dedicated `NetworkPolicy` manifests (`networking.k8s.io/v1`) are not yet applied in `k8s/base/`.
- **Prometheus TSDB Retention:** Default in-cluster Prometheus storage retention is set to 15 days. Full 30-day SLO compliance queries require either an active 30-day cluster runtime or a long-term storage adapter (e.g., Thanos).
- **DNS Resolution:** Local ingress testing relies on wildcard DNS mapping via `192.168.1.20.nip.io` or manual `/etc/hosts` resolution.

---

## Roadmap

- [ ] **Direct Google Gemini API Integration:** Replace regex heuristics with Gemini 1.5 Flash structured output for parsing multilingual invoice attachments and PDFs.
- [ ] **Kubernetes NetworkPolicies:** Implement strict default-deny network policies restricting ingress to MongoDB exclusively from the backend pods.
- [ ] **Managed Cloud Terraform Module:** Provide declarative Terraform modules for bootstrapping EKS/GKE clusters, cert-manager Let's Encrypt certificates, and external DNS.
- [ ] **Thanos Long-Term Metrics:** Deploy Thanos Sidecar and Object Store for multi-month SLO trend visualization.
- [ ] **Multi-Tenant Team Workspaces:** Enable team-level software budgeting, shared seat cost allocation, and department approval workflows.

---

## Author & Acknowledgments

- **Author:** Aditya
- **LinkedIn:** [Aditya's Profile](https://www.linkedin.com/in/)
- **GitHub:** [Aditya-k-11/sub_tracker](https://github.com/Aditya-k-11/sub_tracker)
- **Project Type:** Independent Cloud-Native DevOps Side Project

---

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
