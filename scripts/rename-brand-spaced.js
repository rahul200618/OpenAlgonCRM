const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_IGNORE = ['.git', 'node_modules', '.next', 'dist', 'build', '.vercel'];
const FILES_TO_IGNORE = ['pnpm-lock.yaml', 'skills-lock.json', 'package-lock.json', 'package.json']; // Ignoring package.json to prevent invalid package name (no spaces/caps allowed)

const REPLACEMENTS = [
  // Since I already changed them to OPENALGON CRM, I will change that to OPENALGON CRM
  { search: /openalgoncrm/g, replace: 'OPENALGON CRM' },
  { search: /openalgoncrm/g, replace: 'OPENALGON CRM' },
];

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changed = false;

  for (const { search, replace } of REPLACEMENTS) {
    if (search.test(newContent)) {
      // Don't replace if it's a URL or Database string where spaces break things
      // Just a simple global replace since it's mainly display text and constants
      newContent = newContent.replace(search, replace);
      changed = true;
    }
  }

  // Fix some specific cases where spaces aren't allowed
  if (changed) {
    // Fix database URLs and bucket names
    newContent = newContent.replace(/openalgoncrm:changeme/g, 'openalgoncrm:changeme');
    newContent = newContent.replace(/\/openalgoncrm/g, '/openalgoncrm');
    newContent = newContent.replace(/R2_BUCKET="openalgoncrm"/g, 'R2_BUCKET="openalgoncrm"');
    newContent = newContent.replace(/R2_ACCESS_KEY="openalgoncrm"/g, 'R2_ACCESS_KEY="openalgoncrm"');
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!DIRECTORIES_TO_IGNORE.includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (!FILES_TO_IGNORE.includes(entry.name)) {
        const ext = path.extname(entry.name).toLowerCase();
        const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.woff', '.woff2', '.ttf'];
        if (!binaryExts.includes(ext)) {
          try {
            processFile(fullPath);
          } catch (e) {
            console.error(`Error reading ${fullPath}: ${e.message}`);
          }
        }
      }
    }
  }
}

console.log('Starting string replacement...');
processDirectory(process.cwd());
console.log('Finished string replacement.');
