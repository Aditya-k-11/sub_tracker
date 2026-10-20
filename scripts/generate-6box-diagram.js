import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const diagramHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #090d16;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #f0f6fc;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1000px;
    height: 720px;
    padding: 30px;
    overflow: hidden;
  }
  .container {
    width: 100%;
    height: 100%;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  }
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .title {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .title-tag {
    font-size: 13px;
    font-weight: 700;
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }
  .cluster-badge {
    font-size: 13px;
    color: #94a3b8;
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 20px;
    flex: 1;
    margin-top: 24px;
    margin-bottom: 16px;
    position: relative;
  }

  .box {
    background: #1e293b;
    border-radius: 14px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  }

  .box-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  .box-step {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .box-name {
    font-size: 19px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
  }
  .box-desc {
    font-size: 13.5px;
    color: #94a3b8;
    line-height: 1.45;
  }
  .box-meta {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 12px;
    font-weight: 600;
    font-family: Consolas, monospace;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Specific card accents */
  .box-1 { border-left: 4px solid #f97316; }
  .box-1 .icon-wrap { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
  .box-1 .box-step { color: #fb923c; }
  .box-1 .box-meta { color: #fdba74; }

  .box-2 { border-left: 4px solid #6366f1; }
  .box-2 .icon-wrap { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
  .box-2 .box-step { color: #818cf8; }
  .box-2 .box-meta { color: #a5b4fc; }

  .box-3 { border-left: 4px solid #ef4444; }
  .box-3 .icon-wrap { background: rgba(239, 68, 68, 0.15); color: #f87171; }
  .box-3 .box-step { color: #f87171; }
  .box-3 .box-meta { color: #fca5a5; }

  .box-4 { border-left: 4px solid #38bdf8; }
  .box-4 .icon-wrap { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
  .box-4 .box-step { color: #38bdf8; }
  .box-4 .box-meta { color: #7dd3fc; }

  .box-5 { border-left: 4px solid #34d399; }
  .box-5 .icon-wrap { background: rgba(52, 211, 153, 0.15); color: #34d399; }
  .box-5 .box-step { color: #34d399; }
  .box-5 .box-meta { color: #6ee7b7; }

  .box-6 { border-left: 4px solid #10b981; }
  .box-6 .icon-wrap { background: rgba(16, 185, 129, 0.15); color: #10b981; }
  .box-6 .box-step { color: #10b981; }
  .box-6 .box-meta { color: #6ee7b7; }

  .footer-legend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #64748b;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 14px;
  }
  .flow-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-weight: 500;
  }
  .flow-arrow { color: #38bdf8; font-weight: 800; }
</style>
</head>
<body>
<div class="container">
  <div class="header-bar">
    <div class="title">
      SubTrack Architecture
      <span class="title-tag">6-Box Core Flow</span>
    </div>
    <div class="cluster-badge">
      Kubernetes (kind) • 15 Managed Resources
    </div>
  </div>

  <div class="grid">
    <!-- Box 1 -->
    <div class="box box-1">
      <div>
        <div class="box-top">
          <div class="icon-wrap">⚡</div>
          <div>
            <div class="box-step">01 Source Control</div>
            <div class="box-name">Git Repository</div>
          </div>
        </div>
        <div class="box-desc">
          Single source of truth for both application code and Kubernetes declarative manifests.
        </div>
      </div>
      <div class="box-meta">
        github.com/Aditya-k-11/sub_tracker
      </div>
    </div>

    <!-- Box 2 -->
    <div class="box box-2">
      <div>
        <div class="box-top">
          <div class="icon-wrap">🛠️</div>
          <div>
            <div class="box-step">02 Automated Gates</div>
            <div class="box-name">GitHub Actions CI</div>
          </div>
        </div>
        <div class="box-desc">
          Automated linting, image build with Buildx caching, security verification, and Docker Hub tag & push.
        </div>
      </div>
      <div class="box-meta">
        Run #48 • 1m 6s duration
      </div>
    </div>

    <!-- Box 3 -->
    <div class="box box-3">
      <div>
        <div class="box-top">
          <div class="icon-wrap">🐙</div>
          <div>
            <div class="box-step">03 Declarative CD</div>
            <div class="box-name">ArgoCD Controller</div>
          </div>
        </div>
        <div class="box-desc">
          GitOps reconciliation engine with automated sync, prune, and drift correction across the cluster.
        </div>
      </div>
      <div class="box-meta">
        15 / 15 Resources Synced & Healthy
      </div>
    </div>

    <!-- Box 4 -->
    <div class="box box-4">
      <div>
        <div class="box-top">
          <div class="icon-wrap">🌐</div>
          <div>
            <div class="box-step">04 Traffic Ingress</div>
            <div class="box-name">NGINX Ingress</div>
          </div>
        </div>
        <div class="box-desc">
          L7 edge routing, TLS termination, and path-based routing for SPA frontend and backend API.
        </div>
      </div>
      <div class="box-meta">
        subtrack.local • HTTPS / HTTP
      </div>
    </div>

    <!-- Box 5 -->
    <div class="box box-5">
      <div>
        <div class="box-top">
          <div class="icon-wrap">⚙️</div>
          <div>
            <div class="box-step">05 Scalable Runtime</div>
            <div class="box-name">Backend Service</div>
          </div>
        </div>
        <div class="box-desc">
          Node.js Express API with HPA autoscaling (3 to 6 pods), PodDisruptionBudget, and readiness probes.
        </div>
      </div>
      <div class="box-meta">
        0.00% failed in 3,989-req rollout
      </div>
    </div>

    <!-- Box 6 -->
    <div class="box box-6">
      <div>
        <div class="box-top">
          <div class="icon-wrap">🍃</div>
          <div>
            <div class="box-step">06 Data Layer</div>
            <div class="box-name">MongoDB (v7)</div>
          </div>
        </div>
        <div class="box-desc">
          Stateful document store backed by PersistentVolumeClaim with automated nightly mongodump CronJob.
        </div>
      </div>
      <div class="box-meta">
        mongo-data-pvc • Standard StorageClass
      </div>
    </div>
  </div>

  <div class="footer-legend">
    <div class="flow-indicator">
      <span>Pipeline:</span>
      <span>Git Push</span>
      <span class="flow-arrow">→</span>
      <span>CI Build & Push</span>
      <span class="flow-arrow">→</span>
      <span>ArgoCD GitOps</span>
      <span class="flow-arrow">→</span>
      <span>Ingress</span>
      <span class="flow-arrow">→</span>
      <span>HPA Pods (3→6)</span>
      <span class="flow-arrow">→</span>
      <span>MongoDB v7</span>
    </div>
    <div style="font-size: 12px; color: #64748b;">Zero-downtime rollouts architecture</div>
  </div>
</div>
</body>
</html>`;

const tempHtmlPath = path.join(__dirname, 'temp_6box.html');
fs.writeFileSync(tempHtmlPath, diagramHtml, 'utf8');

const outputPath = path.join(__dirname, '../docs/linkedin/images/2-architecture-6box.png');
const cmd = `"${chromePath}" --headless --disable-gpu --force-device-scale-factor=2 --window-size=1000,720 --screenshot="${outputPath}" "file://${tempHtmlPath.replace(/\\/g, '/')}"`;
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

console.log('Successfully generated docs/linkedin/images/2-architecture-6box.png');
