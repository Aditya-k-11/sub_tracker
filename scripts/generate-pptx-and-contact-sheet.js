import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import pptxgen from 'pptxgenjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const linkedinDir = path.resolve(__dirname, '../docs/linkedin');
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log('=== Step A: Generating PowerPoint (carousel.pptx) ===');
  const pres = new pptxgen();
  
  // Custom slide layout: 4:5 portrait (8 inches x 10 inches)
  pres.defineLayout({ name: 'PORTRAIT_4_5', width: 8.0, height: 10.0 });
  pres.layout = 'PORTRAIT_4_5';

  const slideTitles = [
    'Slide 1: Cover — Subscription Tracker & DevOps Architecture',
    'Slide 2: Architecture — Cloud-Native System Topology',
    'Slide 3: CI/CD — Every push is built and published automatically',
    'Slide 4: GitOps — Git is the single source of truth',
    'Slide 5: Reliability — Making Deployments More Reliable',
    'Slide 6: Autoscaling — Scaling with Kubernetes',
    'Slide 7: Observability — Know what is happening inside the system',
    'Slide 8: Security — Security belongs in the pipeline',
    'Slide 9: Key Takeaways — What I learned'
  ];

  for (let i = 1; i <= 9; i++) {
    const slide = pres.addSlide();
    const pngPath = path.join(linkedinDir, `slide-${i}.png`);
    
    if (fs.existsSync(pngPath)) {
      slide.addImage({
        path: pngPath,
        x: 0,
        y: 0,
        w: 8.0,
        h: 10.0
      });
      console.log(`Added slide-${i}.png to PPTX`);
    } else {
      console.error(`Warning: ${pngPath} not found`);
    }
  }

  const pptxPath = path.join(linkedinDir, 'carousel.pptx');
  const pptxFinalPath = path.join(linkedinDir, 'carousel_editable.pptx');
  const rootPptxPath = path.resolve(__dirname, '../carousel_editable.pptx');
  await pres.writeFile({ fileName: pptxPath });
  fs.copyFileSync(pptxPath, pptxFinalPath);
  fs.copyFileSync(pptxPath, rootPptxPath);
  const pptxSize = fs.statSync(pptxFinalPath).size;
  console.log(`✅ Successfully generated carousel_editable.pptx (${Math.round(pptxSize / 1024)} KB)`);

  console.log('\n=== Step B: Generating Visual Contact Sheet (contact-sheet.png) ===');
  
  const slides = [
    { num: 1, title: 'Cover', file: 'slide-1.png' },
    { num: 2, title: 'Architecture', file: 'slide-2.png' },
    { num: 3, title: 'CI/CD Automation', file: 'slide-3.png' },
    { num: 4, title: 'ArgoCD GitOps', file: 'slide-4.png' },
    { num: 5, title: 'Zero-Downtime Rollout', file: 'slide-5.png' },
    { num: 6, title: 'HPA Autoscaling', file: 'slide-6.png' },
    { num: 7, title: 'RED & Error Budgets', file: 'slide-7.png' },
    { num: 8, title: 'Security Controls', file: 'slide-8.png' },
    { num: 9, title: 'Lessons Learned', file: 'slide-9.png' }
  ];

  // Read slides as base64 so HTML can load them cleanly without CORS or file:// path quirks
  const slideItemsHtml = slides.map(s => {
    const p = path.join(linkedinDir, s.file);
    const b64 = fs.readFileSync(p).toString('base64');
    return `
      <div class="card">
        <div class="card-header">
          <span class="badge">Slide ${s.num}/9</span>
          <span class="card-title">${s.title}</span>
        </div>
        <div class="img-wrapper">
          <img src="data:image/png;base64,${b64}" alt="${s.title}">
        </div>
      </div>
    `;
  }).join('\n');

  const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SubTrack LinkedIn Carousel Contact Sheet</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #06070d;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #f1f5f9;
    padding: 40px;
    width: 1800px;
  }
  .header {
    margin-bottom: 30px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .header-left h1 {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .tag {
    font-size: 14px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .header-left p {
    font-size: 18px;
    color: #94a3b8;
    margin-top: 8px;
  }
  .header-meta {
    text-align: right;
    font-size: 15px;
    color: #64748b;
    line-height: 1.5;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  .card {
    background: #0f121e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  .card-header {
    padding: 14px 18px;
    background: #141828;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .badge {
    font-size: 12px;
    font-weight: 800;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.15);
    padding: 4px 10px;
    border-radius: 6px;
  }
  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .img-wrapper {
    width: 100%;
    aspect-ratio: 4 / 5;
    background: #000;
  }
  .img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>
        SubTrack LinkedIn Carousel
        <span class="tag">9 Slides • 1080 × 1350</span>
      </h1>
      <p>DevOps Engineering Case Study • High-Availability GitOps & Observability</p>
    </div>
    <div class="header-meta">
      <div><strong>Format:</strong> Portrait 4:5 (1080 × 1350 px)</div>
      <div><strong>Evidence Status:</strong> 100% Empirically Verified</div>
      <div><strong>Author:</strong> Aditya</div>
    </div>
  </div>

  <div class="grid">
    ${slideItemsHtml}
  </div>
</body>
</html>`;

  const contactHtmlPath = path.join(linkedinDir, 'temp_contact_sheet.html');
  fs.writeFileSync(contactHtmlPath, contactHtml, 'utf8');

  const contactSheetPng = path.join(linkedinDir, 'contact-sheet.png');
  const cmd = `"${chromePath}" --headless --disable-gpu --window-size=1800,2400 --hide-scrollbars --screenshot="${contactSheetPng}" "file://${contactHtmlPath.replace(/\\/g, '/')}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    const size = fs.statSync(contactSheetPng).size;
    console.log(`✅ Successfully generated contact-sheet.png (${Math.round(size / 1024)} KB)`);
  } catch (err) {
    console.error('Contact sheet generation failed:', err);
  } finally {
    try {
      if (fs.existsSync(contactHtmlPath)) fs.unlinkSync(contactHtmlPath);
    } catch {}
  }
}

main().catch(console.error);
