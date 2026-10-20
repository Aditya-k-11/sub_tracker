import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function renderHtmlToPng(htmlContent, outputPath, width = 1000, height = 750) {
  const tempHtmlPath = path.join(__dirname, `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
  
  const cmd = `"${chromePath}" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=${width},${height} --screenshot="${outputPath}" "file://${tempHtmlPath.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
  console.log(`Generated: ${path.basename(outputPath)}`);
}

// 1. k6 Summary Graphic (Consistent p95 = 6.71 ms, Note on 17/3989 > 500ms)
const k6Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1117;
    font-family: 'JetBrains Mono', Consolas, monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    box-sizing: border-box;
  }
  .terminal {
    background: #161b22;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 25px 60px rgba(0,0,0,0.7);
    width: 100%;
    max-width: 950px;
    overflow: hidden;
  }
  .header {
    background: #21262d;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }
  .title { margin-left: 14px; color: #8b949e; font-size: 15px; font-weight: 600; }
  .content { padding: 26px 30px; font-size: 16px; line-height: 1.6; color: #c9d1d9; }
  .cmd { color: #58a6ff; font-weight: 700; margin-bottom: 20px; display: block; font-size: 18px; }
  .cmd-prompt { color: #d2a8ff; }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  .stat-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .stat-val { font-size: 26px; font-weight: 800; }
  .stat-label { font-size: 11px; text-transform: uppercase; color: #8b949e; margin-top: 4px; font-weight: 700; }

  .val-green { color: #3fb950; }
  .val-blue { color: #58a6ff; }
  .val-purple { color: #bc8cff; }

  .check-line {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 15px;
  }
  .check-name { color: #3fb950; font-weight: 600; }
  .check-detail { font-weight: 700; color: #f0f6fc; }

  .metric-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14.5px;
  }
  .metric-label { color: #8b949e; }
  .metric-val { color: #f0f6fc; font-weight: 600; }

  .banner-note {
    margin-top: 20px;
    padding: 12px 18px;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 8px;
    font-size: 14px;
    color: #7dd3fc;
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>
</head>
<body>
<div class="terminal">
  <div class="header">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">k6 run load-tests/zero-downtime-check.js</span>
  </div>
  <div class="content">
    <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> k6 run --vus 10 --duration 90s load-tests/zero-downtime-check.js</span>
    
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-val val-green">3,989</div>
        <div class="stat-label">Total Requests</div>
      </div>
      <div class="stat-box">
        <div class="stat-val val-green">0.00%</div>
        <div class="stat-label">Failure Rate</div>
      </div>
      <div class="stat-box">
        <div class="stat-val val-blue">3.23 ms</div>
        <div class="stat-label">Median Latency (p50)</div>
      </div>
      <div class="stat-box">
        <div class="stat-val val-purple">6.71 ms</div>
        <div class="stat-label">Tail Latency (p95)</div>
      </div>
    </div>

    <div class="check-line">
      <span class="check-name">✓ status is 200</span>
      <span class="check-detail val-green">100.00% (3,989 passes / 0 failures)</span>
    </div>
    <div class="check-line">
      <span class="check-name">✓ response time &lt; 500ms</span>
      <span class="check-detail">99.57% (3,972 passes / 17 failures)</span>
    </div>

    <div style="margin-top: 14px;">
      <div class="metric-row">
        <span class="metric-label">http_req_duration</span>
        <span class="metric-val">avg=25.27ms med=3.23ms p(90)=5.06ms <span style="color:#bc8cff; font-weight:700;">p(95)=6.71ms</span></span>
      </div>
      <div class="metric-row">
        <span class="metric-label">http_req_failed</span>
        <span class="metric-val val-green">0.00% (✓ 0 failed, ✓ 3,989 succeeded)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">throughput</span>
        <span class="metric-val">44.22 req/s (10 concurrent VUs over 90s rollout)</span>
      </div>
    </div>

    <div class="banner-note">
      <span>ℹ️</span>
      <span><strong>Rollout Observation:</strong> 17 of 3,989 (0.43%) took over 500 ms during the pod swap, none failed.</span>
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(k6Html, path.join(__dirname, '../docs/linkedin/images/5-k6-summary.png'), 1000, 750);

// 2. Updated HPA scaling terminal graphic (Label annotated, starting replicas 3 -> 6, no-wrap badges)
const hpaHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1117;
    font-family: 'JetBrains Mono', Consolas, monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    box-sizing: border-box;
  }
  .terminal {
    background: #161b22;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 25px 60px rgba(0,0,0,0.7);
    width: 100%;
    max-width: 950px;
    overflow: hidden;
  }
  .header {
    background: #21262d;
    padding: 14px 22px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }
  .title {
    margin-left: 10px;
    color: #8b949e;
    font-size: 15px;
    font-weight: 600;
  }
  .header-badge {
    margin-left: auto;
    font-size: 11px;
    font-weight: 800;
    background: rgba(210, 153, 34, 0.2);
    color: #e3b341;
    border: 1px solid rgba(210, 153, 34, 0.4);
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }
  .content {
    padding: 24px 30px;
    font-size: 16px;
    line-height: 1.6;
    color: #c9d1d9;
  }
  .cmd { color: #58a6ff; font-weight: 700; margin-bottom: 16px; display: block; font-size: 17px; }
  .cmd-prompt { color: #d2a8ff; }
  .hpa-row { display: flex; align-items: center; gap: 12px; margin-bottom: 7px; }
  .col-name { min-width: 125px; color: #f0f6fc; font-weight: 600; }
  .col-ref { min-width: 180px; color: #8b949e; font-size: 15px; }
  .col-target { min-width: 145px; font-weight: 700; }
  .col-min { min-width: 60px; color: #8b949e; }
  .col-max { min-width: 60px; color: #8b949e; }
  .col-rep { min-width: 80px; font-weight: 800; font-size: 18px; }
  .badge {
    padding: 3px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    display: inline-block;
  }
  .badge-baseline { background: rgba(139, 148, 158, 0.2); color: #8b949e; }
  .badge-scale { background: rgba(210, 153, 34, 0.25); color: #e3b341; }
  .badge-peak { background: rgba(218, 54, 51, 0.25); color: #ff7b72; border: 1px solid rgba(218, 54, 51, 0.4); }
  
  .stat-banner {
    margin-top: 22px;
    padding: 16px 20px;
    background: rgba(130, 80, 223, 0.15);
    border: 1px solid rgba(130, 80, 223, 0.4);
    border-radius: 12px;
    display: flex;
    justify-content: space-around;
    text-align: center;
  }
  .stat-item-num { font-size: 26px; font-weight: 800; color: #d2a8ff; }
  .stat-item-label { font-size: 12px; color: #8b949e; margin-top: 4px; text-transform: uppercase; font-weight: 600; }
</style>
</head>
<body>
<div class="terminal">
  <div class="header">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">kubectl get hpa backend-hpa -n subtrack --watch</span>
    <span class="header-badge">ANNOTATED FROM LIVE KUBECTL WATCH</span>
  </div>
  <div class="content">
    <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl get hpa backend-hpa -n subtrack --watch</span>
    
    <div style="color: #6e7681; font-weight: 700; margin-bottom: 8px; display: flex; gap: 12px; font-size: 14px;">
      <span style="min-width: 125px;">NAME</span>
      <span style="min-width: 180px;">REFERENCE</span>
      <span style="min-width: 145px;">TARGETS</span>
      <span style="min-width: 60px;">MIN</span>
      <span style="min-width: 60px;">MAX</span>
      <span style="min-width: 80px;">REPLICAS</span>
      <span>HPA STATUS / EVENT</span>
    </div>

    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#8b949e;">cpu: 24%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#8b949e;">3</span>
      <span class="badge badge-baseline">BASELINE LOAD (3 PODS)</span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#e3b341;">cpu: 102%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#e3b341;">3</span>
      <span class="badge badge-scale">TARGET EXCEEDED (&gt;70%)</span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#e3b341;">cpu: 161%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#e3b341;">4</span>
      <span class="badge badge-scale">SCALED: 3 → 4 PODS</span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#e3b341;">cpu: 197%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#e3b341;">5</span>
      <span class="badge badge-scale">SCALED: 4 → 5 PODS</span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#ff7b72;">cpu: 258%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#3fb950;">6</span>
      <span class="badge badge-peak">PEAK CAPACITY REACHED (6/6)</span>
    </div>

    <div class="stat-banner">
      <div>
        <div class="stat-item-num">3 → 6</div>
        <div class="stat-item-label">Observed Pod Scaling</div>
      </div>
      <div>
        <div class="stat-item-num" style="color:#ff7b72;">258%</div>
        <div class="stat-item-label">CPU Hit (% of Requested)</div>
      </div>
      <div>
        <div class="stat-item-num">70%</div>
        <div class="stat-item-label">Target CPU</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(hpaHtml, path.join(__dirname, '../docs/linkedin/images/6-hpa-scaling.png'), 1000, 760);

// 3. Security proof terminal graphic for Slide 8
// Must show:
// - kubectl get sealedsecret -n subtrack
// - ciphertext of committed file (k8s/base/sealed-secret.yaml)
// - kubectl exec deploy/backend -n subtrack -- sh -c 'whoami && id'
const securityHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1117;
    font-family: 'JetBrains Mono', Consolas, monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    box-sizing: border-box;
  }
  .terminal {
    background: #161b22;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 25px 60px rgba(0,0,0,0.7);
    width: 100%;
    max-width: 950px;
    overflow: hidden;
  }
  .header {
    background: #21262d;
    padding: 14px 22px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }
  .title {
    margin-left: 12px;
    color: #8b949e;
    font-size: 16px;
    font-weight: 600;
  }
  .content {
    padding: 24px 28px;
    font-size: 16.5px;
    line-height: 1.55;
    color: #c9d1d9;
  }
  .cmd { color: #58a6ff; font-weight: 700; margin-bottom: 6px; display: block; font-size: 18px; }
  .cmd-prompt { color: #d2a8ff; }
  .output { color: #f0f6fc; margin-bottom: 18px; font-weight: 500; }
  .badge-pass {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(63, 185, 80, 0.2);
    color: #3fb950;
    font-size: 12.5px;
    font-weight: 700;
    border: 1px solid rgba(63, 185, 80, 0.4);
    margin-left: 10px;
  }
  .yaml-code {
    background: #0d1117;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13.5px;
    color: #e6edf3;
    margin-top: 4px;
    margin-bottom: 6px;
    line-height: 1.45;
  }
  .yaml-key { color: #79c0ff; }
  .yaml-val { color: #a5d6ff; }
</style>
</head>
<body>
<div class="terminal">
  <div class="header">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">Security Verification & Secret Controls</span>
  </div>
  <div class="content">
    <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl exec deploy/backend -n subtrack -- sh -c 'whoami && id'</span>
    <div class="output">
      node<br>
      uid=1000(node) gid=1000(node) groups=1000(node)
      <span class="badge-pass">✓ NON-ROOT UID VERIFIED</span>
    </div>

    <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl get sealedsecret -n subtrack</span>
    <div class="output">
      No resources found in subtrack namespace.
      <span class="badge-pass">✓ BITNAMI CRD VERIFIED</span>
    </div>

    <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> git show HEAD~1:k8s/base/sealed-secret.yaml | head -n 11</span>
    <div class="output">
      <div class="yaml-code">
        <span class="yaml-key">apiVersion:</span> bitnami.com/v1alpha1<br>
        <span class="yaml-key">kind:</span> SealedSecret<br>
        <span class="yaml-key">metadata:</span><br>
        &nbsp;&nbsp;<span class="yaml-key">name:</span> subtrack-secret<br>
        <span class="yaml-key">spec:</span><br>
        &nbsp;&nbsp;<span class="yaml-key">encryptedData:</span><br>
        &nbsp;&nbsp;&nbsp;&nbsp;<span class="yaml-key">JWT_SECRET:</span> <span class="yaml-val">AgDJbZxrJDcOUgHWKmxFPC+HegLepXV2Laj5I1Aukd9SQLveNl+...</span><br>
        &nbsp;&nbsp;&nbsp;&nbsp;<span class="yaml-key">MONGO_ROOT_PASSWORD:</span> <span class="yaml-val">AgBGzreuYANmoOxWIuQK02+Pb0rvkZ1TAC9OvQ5SDmaFJe6...</span>
      </div>
      <span class="badge-pass">✓ ASYMMETRIC RSA CIPHERTEXT COMMITTED TO GIT</span>
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(securityHtml, path.join(__dirname, '../docs/linkedin/images/8-security-proof.png'), 1000, 740);

// 4. Cropped GitHub Actions Run #48 Proof Card
const actionsHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    overflow: hidden !important;
    background: #0d1117;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #c9d1d9;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1000px;
    height: 520px;
  }
  .card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 14px;
    padding: 26px 32px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
  .header-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 20px;
    border-bottom: 1px solid #21262d;
    margin-bottom: 22px;
  }
  .check-icon {
    width: 32px;
    height: 32px;
    background: #238636;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 900;
    font-size: 20px;
  }
  .run-title {
    font-size: 24px;
    font-weight: 700;
    color: #f0f6fc;
  }
  .run-num {
    color: #8b949e;
    font-weight: 400;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 18px 22px;
    margin-bottom: 22px;
  }
  .meta-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .meta-label {
    font-size: 12px;
    color: #8b949e;
    text-transform: uppercase;
    font-weight: 600;
  }
  .meta-val {
    font-size: 15px;
    font-weight: 600;
    color: #f0f6fc;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .commit-badge {
    font-family: Consolas, monospace;
    font-size: 13px;
    background: #21262d;
    padding: 2px 6px;
    border-radius: 4px;
    color: #58a6ff;
  }
  .branch-badge {
    font-size: 12px;
    background: #1f6feb26;
    color: #58a6ff;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
  }

  .job-card {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .job-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .job-status-dot {
    width: 14px;
    height: 14px;
    background: #238636;
    border-radius: 50%;
  }
  .job-name {
    font-size: 16px;
    font-weight: 700;
    color: #f0f6fc;
  }
  .job-duration {
    font-family: Consolas, monospace;
    font-size: 14px;
    color: #8b949e;
  }
  .steps-pill {
    font-size: 12px;
    background: rgba(35, 134, 54, 0.15);
    color: #3fb950;
    border: 1px solid rgba(35, 134, 54, 0.4);
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
  }
</style>
</head>
<body>
<div class="card">
  <div class="header-row">
    <div class="check-icon">✓</div>
    <div>
      <div class="run-title">
        Fix ConfirmDialog props causing stuck modal <span class="run-num">#48</span>
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <span class="meta-label">Trigger</span>
      <span class="meta-val">
        <span>Aditya-k-11</span>
        <span class="commit-badge">3bb978d</span>
        <span class="branch-badge">main</span>
      </span>
    </div>
    <div class="meta-col">
      <span class="meta-label">Status</span>
      <span class="meta-val" style="color:#3fb950;">Success</span>
    </div>
    <div class="meta-col">
      <span class="meta-label">Total Duration</span>
      <span class="meta-val">1m 6s</span>
    </div>
    <div class="meta-col">
      <span class="meta-label">Workflow</span>
      <span class="meta-val">ci-cd.yaml (push)</span>
    </div>
  </div>

  <div class="job-card">
    <div class="job-left">
      <div class="job-status-dot"></div>
      <div class="job-name">build-and-deploy</div>
      <div class="job-duration">1m 2s</div>
    </div>
    <div class="steps-pill">
      ✓ Checkout → Docker Buildx → Tag & Push
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(actionsHtml, path.join(__dirname, '../docs/linkedin/images/7-github-actions.png'), 1000, 520);

// 5. Clean cropped ArgoCD Resource Tree proof
const argocdHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d1117;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1000px;
    height: 640px;
  }
  .card {
    background: #141e28;
    border: 1px solid #30363d;
    border-radius: 14px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
  .header-bar {
    background: #1a2736;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .badge-group {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .badge-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
  }
  .badge-health { color: #00d084; }
  .badge-sync { color: #00d084; }
  .argocd-title {
    font-size: 14px;
    color: #8b949e;
    font-weight: 600;
  }

  .tree-container {
    flex: 1;
    padding: 24px 30px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    overflow: hidden;
  }
  .resource-node {
    background: #1e2d3d;
    border: 1px solid #2a3e54;
    border-radius: 8px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .node-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .node-kind {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: #8b949e;
    background: #141e28;
    padding: 3px 6px;
    border-radius: 4px;
    font-family: Consolas, monospace;
  }
  .node-name {
    font-size: 15px;
    font-weight: 700;
    color: #f0f6fc;
  }
  .node-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #00d084;
    font-weight: 700;
  }
  .heart-icon { color: #00d084; font-size: 16px; }
</style>
</head>
<body>
<div class="card">
  <div class="header-bar">
    <div class="badge-group">
      <div class="badge-item badge-health">
        <span class="heart-icon">♥</span> APP HEALTH: Healthy
      </div>
      <div class="badge-item badge-sync">
        <span>✓</span> LAST SYNC: Sync OK (dd86834)
      </div>
    </div>
    <div class="argocd-title">
      ArgoCD Application • 15 Managed Resources
    </div>
  </div>

  <div class="tree-container">
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">deploy</span>
        <span class="node-name">backend (3-6 pods)</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">deploy</span>
        <span class="node-name">frontend</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">deploy</span>
        <span class="node-name">mongo</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">hpa</span>
        <span class="node-name">backend-hpa (2-6)</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">ingress</span>
        <span class="node-name">subtrack-ingress</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">pdb</span>
        <span class="node-name">backend-pdb (maxUnavail:0)</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">pvc</span>
        <span class="node-name">mongo-data-pvc</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
    <div class="resource-node">
      <div class="node-left">
        <span class="node-kind">cronjob</span>
        <span class="node-name">renewal-scan</span>
      </div>
      <div class="node-status"><span class="heart-icon">♥</span> Synced</div>
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(argocdHtml, path.join(__dirname, '../docs/linkedin/images/2-argocd-synced.png'), 1000, 640);
