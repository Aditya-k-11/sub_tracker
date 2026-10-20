import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  console.log('Logging in to get demo token...');
  const loginRes = await fetch('http://127.0.0.1:8082/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Host': 'subtrack.local' },
    body: JSON.stringify({ email: 'demo@subtrack.dev', password: 'Demo@1234' })
  });
  const { user, token } = await loginRes.json();
  console.log('Got token for:', user?.name);

  const profileDir = path.join(process.env.TEMP || 'C:\\TEMP', 'chrome-dash-profile-' + Date.now());
  fs.mkdirSync(profileDir, { recursive: true });

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  console.log('Launching headless Chrome...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1280,1200',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--user-data-dir=${profileDir}`
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  console.log('Connecting to target:', pageTarget.webSocketDebuggerUrl);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === msgId) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:8082/' });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Injecting auth token into localStorage...');
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('subtrack_token', '${token}');
      localStorage.setItem('subtrack_user', JSON.stringify(${JSON.stringify(user)}));
      window.location.href = '/';
    `
  });

  console.log('Waiting for dashboard data to load...');
  await new Promise(r => setTimeout(r, 3500));

  // Verify wasted spend in page text
  const evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText'
  });
  console.log('Page text preview:\n', evalRes.result.value.slice(0, 600));

  console.log('Hiding scrollbars and capturing full dashboard...');
  await send('Runtime.evaluate', {
    expression: 'document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden";'
  });
  const shotRes = await send('Page.captureScreenshot', { format: 'png' });
  const rawPath = path.join(__dirname, '../docs/linkedin/images/1-app-dashboard-raw.png');
  fs.writeFileSync(rawPath, Buffer.from(shotRes.data, 'base64'));
  console.log('Raw screenshot saved:', rawPath);

  // Now capture cropped to summary cards + insight + wasted spend panel
  // Let's get bounding box of the main dashboard container or header + summary + insight
  const boundsRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        // Find the insight card
        const insightCard = Array.from(document.querySelectorAll('div')).find(d => 
          d.innerText && (d.innerText.includes('trial is ending') || d.innerText.includes('not using'))
        )?.closest('.rounded-2xl') || document.querySelector('.rounded-2xl:nth-of-type(4)');
        
        let bottom = 780;
        if (insightCard) {
          const rect = insightCard.getBoundingClientRect();
          bottom = Math.ceil(rect.bottom + window.scrollY + 24);
        }
        return {
          x: 0,
          y: 0,
          width: 1280,
          height: bottom
        };
      })()
    `
  });
  console.log('Crop bounds:', boundsRes.result.value);

  const clip = boundsRes.result.value;
  const croppedRes = await send('Page.captureScreenshot', {
    format: 'png',
    clip: {
      x: 0,
      y: 0,
      width: 1280,
      height: clip.height || 780,
      scale: 1
    }
  });

  const outputPath = path.join(__dirname, '../docs/linkedin/images/1-app-dashboard.png');
  fs.writeFileSync(outputPath, Buffer.from(croppedRes.data, 'base64'));
  console.log('Cropped dashboard saved to:', outputPath);

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch(e) {}
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
