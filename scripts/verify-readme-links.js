import fs from 'fs';
import path from 'path';

const readme = fs.readFileSync('README.md', 'utf-8');
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

let match;
const localLinks = [];

while ((match = linkRegex.exec(readme)) !== null) {
  const url = match[2];
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('#')) {
    localLinks.push(url);
  }
}

console.log('Testing local relative links in README.md:');
let allExist = true;
for (const link of localLinks) {
  // strip hash if any
  const filePath = link.split('#')[0];
  if (!filePath) continue;
  const fullPath = path.resolve('c:/MY WORK/subtrack', filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`- ${link}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  if (!exists) allExist = false;
}

if (allExist) {
  console.log('\n✅ PASS: Every relative file link in README.md exists!');
} else {
  console.log('\n❌ FAIL: Some relative links are missing!');
}
