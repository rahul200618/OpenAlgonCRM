const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_IGNORE = ['.git', 'node_modules', '.next', 'dist', 'build', '.vercel'];
const FILES_TO_IGNORE = ['pnpm-lock.yaml', 'skills-lock.json', 'package-lock.json'];

const REPLACEMENTS = [
  // OPENALGON CRM
  { search: /openalgoncrm/g, replace: 'OPENALGON CRM' },
  { search: /openalgoncrm/g, replace: 'openalgoncrm' },
  { search: /openalgoncrm/g, replace: 'OPENALGON CRM' },
  
  // OPENALGON CRM
  { search: /openalgoncrm/g, replace: 'OPENALGON CRM' },
  { search: /openalgoncrm/g, replace: 'openalgoncrm' },
  { search: /openalgoncrm/g, replace: 'OPENALGON CRM' },

  // OpenAlgon (standalone, mostly for display/translations)
  { search: /OpenAlgon/g, replace: 'OpenAlgon' },
  { search: /openalgon/g, replace: 'openalgon' },
  { search: /OPENALGON/g, replace: 'OPENALGON' },
];

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changed = false;

  for (const { search, replace } of REPLACEMENTS) {
    if (search.test(newContent)) {
      newContent = newContent.replace(search, replace);
      changed = true;
    }
  }

  if (changed) {
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
        // Skip binary files (rudimentary check by extension)
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
