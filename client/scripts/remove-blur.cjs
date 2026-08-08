const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '../src/components');

const replaceInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/bg-white\/70 backdrop-blur-xl/g, 'bg-white/90')
    .replace(/bg-white\/80 backdrop-blur-md/g, 'bg-white/95')
    .replace(/bg-black\/40 backdrop-blur-sm/g, 'bg-black/60');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.jsx')) {
      replaceInFile(filePath);
    }
  }
};

walk(directory);
console.log("Done removing backdrop-blur");
