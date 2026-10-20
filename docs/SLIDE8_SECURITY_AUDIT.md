# SubTrack Security Verification Audit: Slide 8

**Audit Date:** October 20, 2026  
**Auditor:** Senior DevOps & Kubernetes Security Reviewer  
**Scope:** Slide 8 of the SubTrack LinkedIn Carousel (`carousel_final.pdf`, `carousel_editable.pptx`, and associated evidence assets)  
**Publication Status:** **APPROVED & VERIFIED** (Technically accurate, conservative claims, zero exposed credentials)

---

## 1. Executive Summary

Slide 8 of the SubTrack LinkedIn portfolio carousel communicates the project's security controls, container execution identity, and secret management architecture. 

Earlier iterations contained several critical presentation and technical discrepancies:
1. **Misleading Status Badges:** Displayed `kubectl get sealedsecret -n subtrack` returning `No resources found in subtrack namespace.` accompanied by an unsupported green `BITNAMI CRD VERIFIED` label, creating an impression of successful runtime decryption that the evidence did not support.
2. **Ciphertext and Key Exposure:** Displayed raw RSA-encrypted ciphertext blocks for `JWT_SECRET` and `MONGO_ROOT_PASSWORD` pulled from Git history (`git show HEAD~1:k8s/base/sealed-secret.yaml`), which cluttered the mobile presentation and introduced unnecessary exposure risks.
3. **Broadened Claims:** Implied that the entire deployment was secured by Sealed Secrets and that `.env` files were secure merely because Git ignored them, without accounting for historical Git commits or active cluster state.

**Correction Outcome:**  
Slide 8 has been fully corrected and aligned with empirical cluster and repository evidence. All green "pass" badges have been replaced with neutral, descriptive status indicators. The raw manifest dump has been replaced with genuine, reproducible runtime, cluster infrastructure, and Git verification commands. No secret values (plaintext or ciphertext) appear on the slide or in any generated deliverable.

---

## 2. Technical Evidence & Cluster Verification

### Check A: Container Process Identity (Non-Root Execution)
- **Claim:** Backend process verified running as unprivileged UID 1000 (`node`).
- **Empirical Cluster Command:**
  ```bash
  $ kubectl exec deploy/backend -n subtrack -- whoami && id
  node
  uid=1000(node) gid=1000(node) groups=1000(node)
  ```
- **Dockerfile Source Verification (`server/Dockerfile`):**
  ```dockerfile
  # Line 16-25
  COPY --chown=node:node src/ ./src/
  COPY --chown=node:node package.json ./
  RUN mkdir -p logs && chown node:node logs
  USER node
  CMD ["node", "src/server.js"]
  ```
- **Audit Finding:** **VERIFIED**. The Node.js application process runs strictly as unprivileged user `node` (UID 1000, GID 1000) inside the container filesystem.
- **Claim Boundary:** Narrowly and accurately described as the observed process identity. The slide does not claim comprehensive container hardening (such as read-only root filesystems or Seccomp profiles), maintaining strict technical defensibility.

---

### Check B: Bitnami Sealed Secrets Infrastructure & Workload State
- **Claim:** Bitnami Sealed Secrets controller and CRD active in cluster.
- **Empirical Cluster Commands:**
  ```bash
  $ kubectl get crd sealedsecrets.bitnami.com
  NAME                        CREATED AT
  sealedsecrets.bitnami.com   2026-08-12T12:20:19Z

  $ kubectl get pod -n kube-system -l name=sealed-secrets-controller
  NAME                                        READY   STATUS    RESTARTS   AGE
  sealed-secrets-controller-549fdd6dc6-5n4gq  1/1     Running   26         68d
  ```
- **Public Certificate Verification:**
  File `k8s/base/sealed-secrets-public-cert.pem` exists in the repository, representing the public sealing certificate for the cluster controller.
- **Workload Namespace Inspection:**
  ```bash
  $ kubectl get sealedsecret -n subtrack
  No resources found in subtrack namespace.

  $ kubectl get secret -n subtrack
  NAME              TYPE     DATA   AGE
  subtrack-secret   Opaque   7      68d
  ```
- **Audit Finding:** **QUALIFIED & ACCURATELY FRAMED**.
  - The Bitnami Sealed Secrets Custom Resource Definition (`sealedsecrets.bitnami.com`) is installed in the cluster.
  - The `sealed-secrets-controller` pod is actively running in the `kube-system` namespace.
  - However, in the local test cluster, the live application workloads read credentials from `subtrack-secret` (a native Kubernetes `Opaque` secret applied out-of-band). No active `SealedSecret` custom resource exists in the `subtrack` namespace, and `k8s/base/sealed-secret.yaml` is currently empty (0 bytes) in the `HEAD` commit.
- **Correction Applied:** The slide **never claims** that live SubTrack credentials are actively unsealed by the controller at runtime. Instead, it accurately reports the cluster infrastructure layer: *Bitnami Sealed Secrets controller and CRD active in cluster.*

---

### Check C: Git Secret Hygiene & Exclusion
- **Claim:** Sensitive environment files excluded from active Git tracking.
- **Empirical Repository Command:**
  ```bash
  $ git check-ignore server/.env client/.env
  server/.env
  client/.env
  ```
- **Active Tree Status:**
  ```bash
  $ git ls-files server/.env client/.env
  # (Empty output — files are not tracked in the current commit)
  ```
- **`.gitignore` Verification:**
  Root `.gitignore` explicitly filters `*.env`, `.env`, `.env.local`, and `.env.*.local`.
- **Audit Finding:** **VERIFIED**. Local configuration files containing runtime environment variables are strictly ignored by Git rules and untracked in the working tree.

---

## 3. Historical Git Audit & Secret Exposure Analysis

### History Inspection
A forensic scan of the Git commit history revealed that during early development, plaintext secret manifests were committed before GitOps best practices and Sealed Secrets were introduced:
- **Commit `aff59c2`:** Included inline local secret values in `k8s/base/secret.yaml`.
- **Commit `aebd98c`:** Added Grafana credentials in `k8s/observability/grafana-secret.yaml`.
- **Commit `89eb573`:** Migrated to Sealed Secrets, deleting `k8s/base/secret.yaml` and introducing `k8s/base/sealed-secret.yaml` with RSA-OAEP encrypted ciphertext.
- **Commit `032fe3a` & `cba518a`:** Replaced and later emptied `k8s/base/sealed-secret.yaml` during local cluster reconfiguration.

### Security Recommendation: Credential Rotation
> [!WARNING]
> Simply adding `.env` to `.gitignore` protects future commits, but does **not** erase sensitive data previously committed to Git history.
> 
> **Immediate Action Items:**
> 1. **Rotate Credentials:** Before publishing this repository publicly on GitHub, rotate all credentials previously committed to the repository (JWT signing keys, MongoDB root passwords, OAuth client secrets, and Grafana admin passwords).
> 2. **History Cleansing (Optional):** If publishing the commit history publicly, run `git-filter-repo` or BFG Repo-Cleaner to permanently scrub historical commits containing sensitive configuration files.

---

## 4. Visual Presentation & Slide 8 Refinement

### Slide 8 Structure & Content

| Component | Final Slide 8 Content | Rationale / Evidence |
| :--- | :--- | :--- |
| **Header Badge** | `CLOUD NATIVE SECURITY` • `08 / 09` | Consistent branding and sequence. |
| **Slide Title** | **Security Controls & Verification** | Concise, professional heading per specification. |
| **Hero Stat Pill** | `UID 1000 Non-Root • Bitnami CRD In Cluster • Git Secret Hygiene` | Three distinct, verified security facets. |
| **Terminal Image** | `docs/linkedin/images/8-security-proof.png` | 4 clean, genuine commands with neutral status tags. |
| **Command 1** | `kubectl exec deploy/backend -n subtrack -- whoami && id` | Shows runtime UID 1000 (`node`) process identity. |
| **Command 2** | `kubectl get crd sealedsecrets.bitnami.com` | Proves Bitnami CRD is registered in Kubernetes. |
| **Command 3** | `kubectl get pod -n kube-system -l name=sealed-secrets-controller` | Proves controller pod is `Running (1/1)` in `kube-system`. |
| **Command 4** | `git check-ignore server/.env client/.env` | Proves local secret files are excluded by Git rules. |
| **Status Tags** | `OBSERVED: UID 1000`, `BITNAMI CRD REGISTERED`, `CONTROLLER ACTIVE`, `LOCAL SECRETS EXCLUDED` | Neutral slate/cyan/purple tags replacing misleading green checkmarks. |
| **Bullet 1** | Backend process verified running as unprivileged UID 1000 (node). | Narrow, truthful description of container runtime. |
| **Bullet 2** | Bitnami Sealed Secrets controller and CRD active in cluster. | Describes cluster infrastructure readiness accurately. |
| **Bullet 3** | Sensitive environment files excluded from active Git tracking. | Accurately describes active Git tracking posture. |

### Visual Quality & Mobile Readability
- Terminal typography set to 18.5px / 20px monospace with high-contrast color scheme (`#58a6ff` command prompts, `#f0f6fc` outputs).
- Cropped unnecessary terminal whitespace to maximize command output size within the 640px card container.
- High-resolution export verified at 1080 × 1350 px (exact LinkedIn 4:5 portrait aspect ratio).

---

## 5. Artifact Verification & Deliverables

All updated deliverables have been compiled, verified, and placed in the dedicated output directory:

- **Final Carousel PDF:** [`dist/final_carousel/carousel_final.pdf`](file:///c:/MY%20WORK/subtrack/dist/final_carousel/carousel_final.pdf) (3,785 KB, 9 pages)
- **Editable Presentation:** [`dist/final_carousel/carousel_editable.pptx`](file:///c:/MY%20WORK/subtrack/dist/final_carousel/carousel_editable.pptx) (5,223 KB)
- **Individual Slide PNGs:** [`dist/final_carousel/slides/slide-1.png`](file:///c:/MY%20WORK/subtrack/dist/final_carousel/slides/slide-1.png) to [`slide-9.png`](file:///c:/MY%20WORK/subtrack/dist/final_carousel/slides/slide-9.png) (Slide 8 updated; Slides 1–7 and 9 completely preserved)
- **Visual Contact Sheet:** [`dist/final_carousel/contact_sheet.png`](file:///c:/MY%20WORK/subtrack/dist/final_carousel/contact_sheet.png) (1,450 KB, high-resolution 3×3 matrix)
- **Terminal Asset:** [`dist/final_carousel/assets/8-security-proof.png`](file:///c:/MY%20WORK/subtrack/dist/final_carousel/assets/8-security-proof.png)

### Final Audit Conclusion
Slide 8 is technically accurate, completely free of secret exposure risks, visually refined for mobile viewing, and 100% defensible during a technical DevOps review.
