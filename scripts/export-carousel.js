import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const slidesHtmlPath = path.join(__dirname, '../docs/linkedin/slides.html');
const outputDir = path.join(__dirname, '../docs/linkedin');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Export individual slide PNGs (slide-1.png to slide-9.png)
const fullHtml = fs.readFileSync(slidesHtmlPath, 'utf8');

const headMatch = fullHtml.match(/<head>([\s\S]*?)<\/head>/i);
const headContent = headMatch ? headMatch[1] : '';

console.log('--- Step 1: Exporting 9 PNG Slides (1080x1350) ---');

for (let i = 1; i <= 9; i++) {
  console.log(`Rendering slide-${i}.png...`);
  const slideRegex = new RegExp(`<section class="slide" id="slide-${i}">([\\s\\S]*?)<\\/section>`, 'i');
  const slideMatch = fullHtml.match(slideRegex);

  if (!slideMatch) {
    console.error(`Slide ${i} not found!`);
    continue;
  }

  const singleSlideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
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

  const tempHtmlPath = path.join(outputDir, `temp_slide_${i}.html`);
  fs.writeFileSync(tempHtmlPath, singleSlideHtml, 'utf8');

  const pngPath = path.join(outputDir, `slide-${i}.png`);
  const pngCmd = `"${chromePath}" --headless --disable-gpu --window-size=1080,1350 --hide-scrollbars --screenshot="${pngPath}" "file://${tempHtmlPath.replace(/\\/g, '/')}"`;

  try {
    execSync(pngCmd, { stdio: 'inherit' });
    const size = fs.statSync(pngPath).size;
    console.log(`✓ Generated slide-${i}.png (${Math.round(size / 1024)} KB)`);
  } catch (err) {
    console.error(`PNG export for slide ${i} failed:`, err);
  } finally {
    try {
      if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
      }
    } catch {}
  }
}

// 2. Export carousel.pdf by stitching PNGs directly into PDF pages
console.log('\n--- Step 2: Exporting carousel.pdf from PNGs ---');
async function compilePdfFromPngs() {
  const pdfDoc = await PDFDocument.create();

  for (let i = 1; i <= 9; i++) {
    const pngPath = path.join(outputDir, `slide-${i}.png`);
    if (!fs.existsSync(pngPath)) {
      console.error(`Missing slide-${i}.png, skipping in PDF`);
      continue;
    }
    const pngBytes = fs.readFileSync(pngPath);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    
    // Exact 1080x1350 page matching LinkedIn carousel aspect ratio (4:5)
    const page = pdfDoc.addPage([1080, 1350]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 1080,
      height: 1350,
    });
    console.log(`Added slide ${i} to PDF`);
  }

  const pdfBytes = await pdfDoc.save();
  const pdfPath = path.join(outputDir, 'carousel.pdf');
  const pdfFinalPath = path.join(outputDir, 'carousel_final.pdf');
  const rootFinalPath = path.join(__dirname, '../carousel_final.pdf');
  fs.writeFileSync(pdfPath, pdfBytes);
  fs.writeFileSync(pdfFinalPath, pdfBytes);
  fs.writeFileSync(rootFinalPath, pdfBytes);
  const pdfSize = fs.statSync(pdfFinalPath).size;
  console.log(`\n✓ Successfully compiled carousel.pdf & carousel_final.pdf (${Math.round(pdfSize / 1024)} KB)!`);
}

compilePdfFromPngs().then(() => {
  console.log('\nAll exports completed successfully!');
}).catch(err => {
  console.error('Error compiling PDF from PNGs:', err);
});
