# SubTrack — Subscription & Recurring Payment Intelligence Platform

SubTrack is a full-stack platform that aggregates recurring subscriptions, tracks your spending patterns, and proactively surfaces unused services to help you eliminate wasted spending.

## Why This Exists

The modern consumer subscribes to dozens of services, making it incredibly easy to lose track of free trials converting to paid, or services paid for but never used. SubTrack exists to bridge the gap between static subscription lists and actionable financial intelligence. Moving beyond a simple CRUD app, SubTrack analyzes real usage patterns to flag wasted spend and generates prioritized alerts so you never accidentally pay for a forgotten trial again.

<!-- TODO: add dashboard screenshot and a short demo GIF here before sharing this repo publicly -->

## Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS, Recharts, React Router |
| **Backend** | Node.js, Express, Winston (logging), node-cron (scheduling) |
| **Database** | MongoDB, Mongoose |
| **DevOps & Infrastructure** | Docker, Docker Compose, Kubernetes (kind) |
| **GitOps Deployment** | ArgoCD, Kustomize |

## Key Features

* **Full subscription lifecycle management:** Create, edit, cancel, and log usage for all subscriptions.
* **Spend analytics:** View monthly/yearly totals, category breakdowns, and historical trends.
* **Automatic wasted-spend detection:** Intelligently flags subscriptions based on real usage patterns.
* **Prioritized notifications:** Automated, scheduled alerts for upcoming renewals and free-trial endings.
* **GitOps automated deployment:** Fully containerized (Docker) and deployed on Kubernetes, with continuous deployment via ArgoCD.

## Architecture

SubTrack employs a modern, three-tier containerized architecture designed for Kubernetes. The React frontend serves as a single-page application communicating securely with an Express.js REST API. The API layer handles core business logic, background cron jobs for renewal scanning, and data persistence using MongoDB. The entire application is deployed using a strict GitOps model: infrastructure and application manifests are defined using Kustomize and automatically synchronized to the Kubernetes cluster by ArgoCD upon every commit.

See the full System Design Document for detailed architecture diagrams: `docs/SubTrack_PRD_Architecture.docx`
For the complete phase-by-phase build plan, see `SubTrack_Project_Breakdown.md`

## Project Structure

```text
subtrack/
├── client/                 # React frontend SPA (Vite, Tailwind, Recharts)
├── server/                 # Node.js/Express backend API (Mongoose, Winston, node-cron)
├── k8s/                    # Kubernetes GitOps source of truth
│   ├── base/               # Core application manifests and Kustomize config
│   └── argocd/             # ArgoCD Application and notifications configuration
├── scripts/                # Database seed data and development utility scripts
├── docs/                   # Documentation, demo scripts, and integration test logs
├── docker-compose.yml      # Local Docker Compose configuration for quick local bootstrapping
└── README.md               # Project documentation
```

## Getting Started

You can run SubTrack in three different ways depending on your needs, from a simple local development setup to a full Kubernetes GitOps deployment.

### Option A — Local development (no Docker/Kubernetes)
**Prerequisites:** Node.js (v20+ recommended) and MongoDB running locally.

1. **Start the Backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env  # Edit .env and fill in your local MongoDB URI and real values
   npm run dev
   ```
2. **Start the Frontend:**
   ```bash
   cd client
   npm install
   cp .env.example .env  # Edit .env and fill in real values if needed
   npm run dev
   ```
3. **Seed Demo Data:**
   Run the following from the project root to populate the database with realistic demo data:
   ```bash
   npm install
   npm run seed
   ```

### Option B — Docker Compose (full stack, no Kubernetes)
**Prerequisites:** Docker installed and running.

1. **Configure Environment:**
   ```bash
   cp .env.example .env  # Edit .env at the root and fill in real values
   ```
2. **Start the Stack:**
   ```bash
   docker-compose up --build
   ```
3. **Seed Demo Data:**
   Point the seed script to the Docker Compose MongoDB instance (using the credentials from your `.env`):
   ```bash
   npm install
   MONGO_URI="mongodb://subtrack_admin:change_me_locally@127.0.0.1:27017/subtrack?authSource=admin" npm run seed
   ```

### Option C — Full Kubernetes deployment
**Prerequisites:** `kind` or `minikube`, `kubectl`, the ArgoCD CLI, and a local hosts file entry mapping `127.0.0.1` to `subtrack.local`.

1. **Create Cluster & Load Images:**
   ```bash
   kind create cluster --config k8s/kind-config.yaml
   docker build -t subtrack-backend:local ./server
   docker build -t subtrack-frontend:v3 ./client
   kind load docker-image subtrack-backend:local subtrack-frontend:v3 --name subtrack-cluster
   ```
2. **Apply Core Manifests:**
   Before applying, ensure you configure your `k8s/base/sealed-secret.yaml` (see Known Limitations section regarding secrets).
   ```bash
   kubectl apply -k k8s/base/
   ```
3. **Install ArgoCD & Apply GitOps Configuration:**
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   kubectl apply -f k8s/argocd/application.yaml
   ```
4. **Access the App:**
   Once pods are healthy and the ingress is active, visit [http://subtrack.local](http://subtrack.local).

---

## Demo Credentials

To quickly evaluate the project without creating an account from scratch, log in with:
* **Email:** `demo@subtrack.dev`
* **Password:** `Demo@1234`

*Note: Run `npm run seed` first to populate this account with realistic demo subscriptions and usage data.*

## Reliability Engineering

SubTrack implements a complete Site Reliability Engineering (SRE) practice, going beyond standard metrics collection. The `docs/reliability/` folder contains formal Service Level Indicators (SLIs), Service Level Objectives (SLOs), real-time Error Budget calculations, and multi-window burn-rate alerting. This is governed by a written Error Budget Policy that objectively triggers when to pause feature work, ensuring reliability decisions are driven by data rather than subjective debate.

## Known Limitations

* **Single-node local cluster only:** The Kubernetes setup relies on `kind` and `rancher.io/local-path`; it has not been tested against a real managed cloud Kubernetes cluster (e.g. EKS/GKE).
* **Sealed Secrets setup required for GitOps:** SubTrack uses Bitnami Sealed Secrets to safely commit encrypted configuration (like the MongoDB URI) to Git. Because `sealed-secret.yaml` is cryptographically tied to the specific cluster that generated it, anyone cloning this repository will need to install their own Sealed Secrets controller in their cluster, generate their own `secret.yaml` with their values, and seal it to their cluster using `kubeseal` for the deployment to succeed.
* **No CI pipeline for image builds:** Manifest changes are Git-driven via ArgoCD, but Docker image builds (and pushing to a registry) are currently manual.
* **No email/SMS delivery for user alerts:** Currently, user renewal and trial alerts are only displayed in-app (though system-level ArgoCD crash/sync alerts are routed to Gmail).

## License

This project is licensed under the MIT License.
