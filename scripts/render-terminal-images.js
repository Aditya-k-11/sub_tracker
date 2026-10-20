import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function renderHtmlToPng(htmlContent, outputPath, width = 1000, height = 780) {
  const tempHtmlPath = path.join(__dirname, 'temp_render.html');
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
  
  const cmd = `"${chromePath}" --headless --disable-gpu --force-device-scale-factor=2 --window-size=${width},${height} --screenshot="${outputPath}" "file://${tempHtmlPath.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}

// 1. Updated HPA scaling terminal graphic
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
    padding: 16px 22px;
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
    margin-left: 14px;
    color: #8b949e;
    font-size: 16px;
    font-weight: 600;
  }
  .content {
    padding: 26px 30px;
    font-size: 17px;
    line-height: 1.65;
    color: #c9d1d9;
  }
  .cmd { color: #58a6ff; font-weight: 700; margin-bottom: 18px; display: block; font-size: 18px; }
  .cmd-prompt { color: #d2a8ff; }
  .hpa-row { display: flex; gap: 12px; margin-bottom: 8px; align-items: center; }
  .col-name { min-width: 125px; color: #f0f6fc; }
  .col-ref { min-width: 175px; color: #8b949e; }
  .col-target { min-width: 145px; font-weight: 700; }
  .col-min { min-width: 55px; color: #8b949e; }
  .col-max { min-width: 55px; color: #8b949e; }
  .col-rep { min-width: 75px; font-weight: 800; font-size: 18px; }
  .badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    display: inline-block;
  }
  .badge-baseline { background: rgba(139, 148, 158, 0.2); color: #8b949e; }
  .badge-scale { background: rgba(210, 153, 34, 0.25); color: #e3b341; }
  .badge-peak { background: rgba(218, 54, 51, 0.25); color: #ff7b72; border: 1px solid rgba(218, 54, 51, 0.4); }
  .stat-banner {
    margin-top: 24px;
    padding: 16px 20px;
    background: rgba(130, 80, 223, 0.15);
    border: 1px solid rgba(130, 80, 223, 0.4);
    border-radius: 12px;
    display: flex;
    justify-content: space-around;
    text-align: center;
  }
  .stat-item-num { font-size: 28px; font-weight: 800; color: #d2a8ff; }
  .stat-item-label { font-size: 12px; color: #8b949e; margin-top: 4px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
</style>
</head>
<body>
<div class="terminal">
  <div class="header">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">kubectl get hpa backend-hpa -n subtrack --watch</span>
  </div>
  <div class="content">
    <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl get hpa backend-hpa -n subtrack --watch</span>
    
    <div style="color: #6e7681; font-weight: 700; margin-bottom: 10px; display: flex; gap: 12px; font-size: 14px;">
      <span style="min-width: 125px;">NAME</span>
      <span style="min-width: 175px;">REFERENCE</span>
      <span style="min-width: 145px;">TARGETS</span>
      <span style="min-width: 55px;">MIN</span>
      <span style="min-width: 55px;">MAX</span>
      <span style="min-width: 75px;">REPLICAS</span>
      <span>HPA EVENT</span>
    </div>

    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#8b949e;">cpu: 28%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#8b949e;">3</span>
      <span><span class="badge badge-baseline">BASELINE LOAD (3 PODS)</span></span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#e3b341;">cpu: 102%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#e3b341;">3</span>
      <span><span class="badge badge-scale">TARGET EXCEEDED (&gt;70%)</span></span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#e3b341;">cpu: 161%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#e3b341;">4</span>
      <span><span class="badge badge-scale">SCALED: 3 → 4 PODS</span></span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#e3b341;">cpu: 197%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#e3b341;">5</span>
      <span><span class="badge badge-scale">SCALED: 4 → 5 PODS</span></span>
    </div>
    <div class="hpa-row">
      <span class="col-name">backend-hpa</span>
      <span class="col-ref">Deployment/backend</span>
      <span class="col-target" style="color:#ff7b72;">cpu: 258%/70%</span>
      <span class="col-min">2</span>
      <span class="col-max">6</span>
      <span class="col-rep" style="color:#3fb950;">6</span>
      <span><span class="badge badge-peak">PEAK REACHED (6/6 PODS)</span></span>
    </div>

    <div class="stat-banner">
      <div>
        <div class="stat-item-num" style="color:#34d399;">3 → 6</div>
        <div class="stat-item-label">Observed Scaling</div>
      </div>
      <div>
        <div class="stat-item-num" style="color:#ff7b72;">258%</div>
        <div class="stat-item-label">Peak CPU (Target 70%)</div>
      </div>
      <div>
        <div class="stat-item-num" style="color:#38bdf8;">2 → 6</div>
        <div class="stat-item-label">Configured HPA Range</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(hpaHtml, path.join(__dirname, '../docs/linkedin/images/6-hpa-scaling.png'), 1000, 780);
console.log('Regenerated 6-hpa-scaling.png');

// 2. Security proof terminal graphic for Slide 8
const securityHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 16px;
    background: #0d1117;
    font-family: 'JetBrains Mono', Consolas, 'Fira Code', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    box-sizing: border-box;
  }
  .terminal {
    background: #161b22;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 20px 50px rgba(0,0,0,0.7);
    width: 100%;
    max-width: 960px;
    overflow: hidden;
  }
  .header {
    background: #21262d;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
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
    padding: 22px 28px;
    font-size: 18.5px;
    line-height: 1.55;
    color: #c9d1d9;
  }
  .cmd-group {
    margin-bottom: 18px;
  }
  .cmd-group:last-child {
    margin-bottom: 0;
  }
  .cmd {
    color: #58a6ff;
    font-weight: 700;
    margin-bottom: 4px;
    display: block;
    font-size: 20px;
  }
  .cmd-prompt { color: #d2a8ff; }
  .output {
    color: #f0f6fc;
    font-weight: 500;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    white-space: pre;
  }
  .badge-tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 5px;
    font-size: 13.5px;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.3px;
    flex-shrink: 0;
  }
  .badge-cyan {
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.35);
  }
  .badge-slate {
    background: rgba(148, 163, 184, 0.12);
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.3);
  }
  .badge-purple {
    background: rgba(192, 132, 252, 0.12);
    color: #c084fc;
    border: 1px solid rgba(192, 132, 252, 0.35);
  }
</style>
</head>
<body>
<div class="terminal">
  <div class="header">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">Security Controls &amp; Verification — Runtime, Cluster &amp; Repository</span>
  </div>
  <div class="content">
    <div class="cmd-group">
      <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl exec deploy/backend -n subtrack -- whoami && id</span>
      <div class="output">
<span>node
uid=1000(node) gid=1000(node) groups=1000(node)</span>
        <span class="badge-tag badge-cyan">OBSERVED: UID 1000 (NON-ROOT)</span>
      </div>
    </div>

    <div class="cmd-group">
      <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl get crd sealedsecrets.bitnami.com</span>
      <div class="output">
<span>NAME                        CREATED AT
sealedsecrets.bitnami.com   2026-08-12T12:20:19Z</span>
        <span class="badge-tag badge-slate">BITNAMI CRD REGISTERED</span>
      </div>
    </div>

    <div class="cmd-group">
      <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> kubectl get pod -n kube-system -l name=sealed-secrets-controller</span>
      <div class="output">
<span>NAME                                        READY   STATUS
sealed-secrets-controller-549fdd6dc6-5n4gq  1/1     Running</span>
        <span class="badge-tag badge-slate">CONTROLLER ACTIVE (1/1)</span>
      </div>
    </div>

    <div class="cmd-group">
      <span class="cmd"><span class="cmd-prompt">~/subtrack $</span> git check-ignore server/.env client/.env</span>
      <div class="output">
<span>server/.env
client/.env</span>
        <span class="badge-tag badge-purple">LOCAL SECRETS EXCLUDED FROM GIT</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

renderHtmlToPng(securityHtml, path.join(__dirname, '../docs/linkedin/images/8-security-proof.png'), 1000, 680);
console.log('Generated 8-security-proof.png');
