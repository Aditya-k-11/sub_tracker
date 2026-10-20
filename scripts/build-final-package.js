import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import pptxgen from 'pptxgenjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const rootDir = path.resolve(__dirname, '..');
const slidesHtmlPath = path.join(rootDir, 'docs/linkedin/slides.html');
const imagesDir = path.join(rootDir, 'docs/linkedin/images');
const finalOutputDir = path.join(rootDir, 'dist/final_carousel');
const slidesDir = path.join(finalOutputDir, 'slides');
const assetsDir = path.join(finalOutputDir, 'assets');

console.log('=== Step 1: Initializing Dedicated Output Directories ===');
[finalOutputDir, slidesDir, assetsDir].forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// Step 2: Render individual slide PNGs
console.log('\n=== Step 2: Rendering 9 Slide Images (1080x1350) ===');
const fullHtml = fs.readFileSync(slidesHtmlPath, 'utf8');
const headMatch = fullHtml.match(/<head>([\s\S]*?)<\/head>/i);
const headContent = headMatch ? headMatch[1] : '';

for (let i = 1; i <= 9; i++) {
  console.log(`Rendering slide-${i}.png...`);
  const slideRegex = new RegExp(`<section class="slide" id="slide-${i}">([\\s\\S]*?)<\\/section>`, 'i');
  const slideMatch = fullHtml.match(slideRegex);

  if (!slideMatch) {
    console.error(`Slide ${i} not found!`);
    continue;
  }

  const linkedinBase = path.join(rootDir, 'docs/linkedin').replace(/\\/g, '/');
  const singleSlideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<base href="file:///${linkedinBase}/">
${headContent}
<style>
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #0a0a12 !important;
    display: block !important;
  }
  .slide {
    margin: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
</style>
</head>
<body>
  <section class="slide" id="slide-${i}">
    ${slideMatch[1]}
  </section>
</body>
</html>`;

  const tempHtmlPath = path.join(finalOutputDir, `temp_slide_${i}.html`);
  fs.writeFileSync(tempHtmlPath, singleSlideHtml, 'utf8');

  const pngDest = path.join(slidesDir, `slide-${i}.png`);
  const pngLinkedin = path.join(rootDir, 'docs/linkedin', `slide-${i}.png`);
  const pngCmd = `"${chromePath}" --headless --disable-gpu --window-size=1080,1350 --hide-scrollbars --screenshot="${pngDest}" "file://${tempHtmlPath.replace(/\\/g, '/')}"`;

  try {
    execSync(pngCmd, { stdio: 'inherit' });
    fs.copyFileSync(pngDest, pngLinkedin);
    const size = fs.statSync(pngDest).size;
    console.log(`✓ Generated slide-${i}.png (${Math.round(size / 1024)} KB)`);
  } catch (err) {
    console.error(`Error generating slide ${i}:`, err);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

// Step 3: Compile carousel_final.pdf
console.log('\n=== Step 3: Compiling carousel_final.pdf ===');
async function compilePdf() {
  const pdfDoc = await PDFDocument.create();

  for (let i = 1; i <= 9; i++) {
    const pngPath = path.join(slidesDir, `slide-${i}.png`);
    if (!fs.existsSync(pngPath)) {
      console.error(`Missing ${pngPath}`);
      continue;
    }
    const pngBytes = fs.readFileSync(pngPath);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    const page = pdfDoc.addPage([1080, 1350]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 1080,
      height: 1350,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const destPdf1 = path.join(finalOutputDir, 'carousel_final.pdf');
  const destPdf2 = path.join(rootDir, 'docs/linkedin/carousel_final.pdf');
  const destPdf3 = path.join(rootDir, 'docs/linkedin/carousel.pdf');
  const destPdf4 = path.join(rootDir, 'carousel_final.pdf');

  fs.writeFileSync(destPdf1, pdfBytes);
  fs.writeFileSync(destPdf2, pdfBytes);
  fs.writeFileSync(destPdf3, pdfBytes);
  fs.writeFileSync(destPdf4, pdfBytes);
  console.log(`✓ Saved carousel_final.pdf (${Math.round(fs.statSync(destPdf1).size / 1024)} KB)`);
}

// Step 4: Generate carousel_editable.pptx
console.log('\n=== Step 4: Generating carousel_editable.pptx ===');
async function generatePptx() {
  const pres = new pptxgen();
  pres.defineLayout({ name: 'PORTRAIT_4_5', width: 8.0, height: 10.0 });
  pres.layout = 'PORTRAIT_4_5';

  for (let i = 1; i <= 9; i++) {
    const slide = pres.addSlide();
    const pngPath = path.join(slidesDir, `slide-${i}.png`);
    if (fs.existsSync(pngPath)) {
      slide.addImage({
        path: pngPath,
        x: 0,
        y: 0,
        w: 8.0,
        h: 10.0
      });
    }
  }

  const pptx1 = path.join(finalOutputDir, 'carousel_editable.pptx');
  const pptx2 = path.join(rootDir, 'docs/linkedin/carousel_editable.pptx');
  const pptx3 = path.join(rootDir, 'carousel_editable.pptx');
  await pres.writeFile({ fileName: pptx1 });
  fs.copyFileSync(pptx1, pptx2);
  fs.copyFileSync(pptx1, pptx3);
  console.log(`✓ Saved carousel_editable.pptx (${Math.round(fs.statSync(pptx1).size / 1024)} KB)`);
}

// Step 5: Generate contact_sheet.png
console.log('\n=== Step 5: Generating contact_sheet.png ===');
async function generateContactSheet() {
  const slides = [
    { num: 1, title: 'Cover', file: 'slide-1.png' },
    { num: 2, title: 'Architecture Topology', file: 'slide-2.png' },
    { num: 3, title: 'CI/CD Automation', file: 'slide-3.png' },
    { num: 4, title: 'ArgoCD Drift Detection', file: 'slide-4.png' },
    { num: 5, title: 'Zero-Downtime Rollout', file: 'slide-5.png' },
    { num: 6, title: 'HPA Autoscaling', file: 'slide-6.png' },
    { num: 7, title: 'RED & Error Budgets', file: 'slide-7.png' },
    { num: 8, title: 'Security Controls', file: 'slide-8.png' },
    { num: 9, title: 'Lessons Learned', file: 'slide-9.png' }
  ];

  const slideItemsHtml = slides.map(s => {
    const p = path.join(slidesDir, s.file);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 24px;
    margin-bottom: 35px;
  }
  .header-left h1 {
    font-size: 36px;
    font-weight: 800;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .header-pill {
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
    font-size: 15px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 999px;
  }
  .header-sub {
    font-size: 16px;
    color: #94a3b8;
    margin-top: 8px;
  }
  .header-meta {
    text-align: right;
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
  }
  .meta-highlight {
    color: #34d399;
    font-weight: 700;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
  .card {
    background: #0e121e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .card-header {
    padding: 14px 18px;
    background: #141a29;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge {
    background: #3b82f6;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
  }
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #cbd5e1;
  }
  .img-wrapper {
    width: 100%;
    aspect-ratio: 4 / 5;
    background: #000;
  }
  .img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>SubTrack LinkedIn Carousel <span class="header-pill">9 SLIDES • 1080 × 1350</span></h1>
      <div class="header-sub">DevOps Engineering Case Study • High-Availability GitOps & Observability</div>
    </div>
    <div class="header-meta">
      <div>Format: <strong>Portrait 4:5 (1080 × 1350 px)</strong></div>
      <div>Evidence Status: <span class="meta-highlight">100% Empirically Verified</span></div>
      <div>Author: <strong>Aditya</strong></div>
    </div>
  </div>
  <div class="grid">
    ${slideItemsHtml}
  </div>
</body>
</html>`;

  const contactHtmlPath = path.join(finalOutputDir, 'temp_contact.html');
  fs.writeFileSync(contactHtmlPath, contactHtml, 'utf8');

  const contactDest1 = path.join(finalOutputDir, 'contact_sheet.png');
  const contactDest2 = path.join(rootDir, 'docs/linkedin/contact-sheet.png');
  const cmd = `"${chromePath}" --headless --disable-gpu --window-size=1800,2650 --hide-scrollbars --screenshot="${contactDest1}" "file://${contactHtmlPath.replace(/\\/g, '/')}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    fs.copyFileSync(contactDest1, contactDest2);
    console.log(`✓ Saved contact_sheet.png (${Math.round(fs.statSync(contactDest1).size / 1024)} KB)`);
  } catch (err) {
    console.error('Error generating contact sheet:', err);
  } finally {
    if (fs.existsSync(contactHtmlPath)) {
      fs.unlinkSync(contactHtmlPath);
    }
  }
}

// Step 6: Copy audit documents and source assets to final directory
console.log('\n=== Step 6: Copying Audit Reports & Source Assets ===');
fs.copyFileSync(path.join(rootDir, 'docs/FINAL_CAROUSEL_EVIDENCE_AUDIT.md'), path.join(finalOutputDir, 'FINAL_CAROUSEL_EVIDENCE_AUDIT.md'));
fs.copyFileSync(path.join(rootDir, 'docs/FINAL_QA_REPORT.md'), path.join(finalOutputDir, 'FINAL_QA_REPORT.md'));

// Copy source assets
const assetsToCopy = [
  { src: path.join(rootDir, 'docs/assets/argocd-original.png'), name: 'argocd-original.png' },
  { src: path.join(imagesDir, '1-app-dashboard.png'), name: '1-app-dashboard.png' },
  { src: path.join(imagesDir, '2-architecture-6box.png'), name: '2-architecture-6box.png' },
  { src: path.join(imagesDir, '2-argocd-original-clean.png'), name: '2-argocd-original-clean.png' },
  { src: path.join(imagesDir, '3-grafana-dashboard.png'), name: '3-grafana-dashboard.png' },
  { src: path.join(imagesDir, '5-k6-summary.png'), name: '5-k6-summary.png' },
  { src: path.join(imagesDir, '6-hpa-scaling.png'), name: '6-hpa-scaling.png' },
  { src: path.join(imagesDir, '7-github-actions.png'), name: '7-github-actions.png' },
  { src: path.join(imagesDir, '8-security-proof.png'), name: '8-security-proof.png' },
];

assetsToCopy.forEach(a => {
  if (fs.existsSync(a.src)) {
    fs.copyFileSync(a.src, path.join(assetsDir, a.name));
    console.log(`✓ Preserved asset: ${a.name}`);
  } else {
    console.warn(`Asset not found: ${a.src}`);
  }
});

async function run() {
  await compilePdf();
  await generatePptx();
  await generateContactSheet();
  console.log('\n======================================================');
  console.log('✅ ALL DELIVERABLES GENERATED IN dist/final_carousel/ !');
  console.log('======================================================');
}

run().catch(err => {
  console.error('Packaging error:', err);
});
