const fs = require('fs');
const glob = require('glob');
const strip = require('strip-comments');

const jsFiles = glob.sync('**/*.{js,jsx}', {
  ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
});

jsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const stripped = strip(content, { preserveNewlines: false });
    
    const cleaned = stripped.replace(/\n\s*\n\s*\n/g, '\n\n');
    fs.writeFileSync(file, cleaned);
    console.log(`Stripped JS: ${file}`);
  } catch (err) {
    console.error(`Failed JS: ${file}`, err);
  }
});

const yamlFiles = glob.sync('**/*.yaml', {
  ignore: ['node_modules/**', '.git/**']
});

yamlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const stripped = lines.filter(line => !line.trim().startsWith('#')).join('\n');
    fs.writeFileSync(file, stripped);
    console.log(`Stripped YAML: ${file}`);
  } catch (err) {
    console.error(`Failed YAML: ${file}`, err);
  }
});
