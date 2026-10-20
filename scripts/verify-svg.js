import fs from 'fs';

const svg = fs.readFileSync('docs/architecture.svg', 'utf-8');
const httpMatches = svg.match(/https?:\/\/[^\s"'>]+/g) || [];
const nonW3c = httpMatches.filter(m => !m.includes('w3.org'));

console.log('Total URLs found in SVG:', httpMatches.length);
console.log('Non-W3C namespace URLs found:', nonW3c);

if (nonW3c.length === 0) {
  console.log('✅ PASS: No external image or resource URLs inside docs/architecture.svg! All logos are 100% embedded.');
} else {
  console.log('❌ FAIL: Found external URLs:', nonW3c);
}
