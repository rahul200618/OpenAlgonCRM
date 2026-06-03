const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_IGNORE = ['.git', 'node_modules', '.next', 'dist', 'build', '.vercel'];
const FILES_TO_IGNORE = ['pnpm-lock.yaml', 'package-lock.json', 'package.json'];

const REPLACEMENTS = [
  { search: /R2_BUCKET/g, replace: 'R2_BUCKET' },
  { search: /R2_ENDPOINT/g, replace: 'R2_ENDPOINT' },
  { search: /R2_PUBLIC_URL/g, replace: 'R2_PUBLIC_URL' },
  { search: /R2_ACCESS_KEY/g, replace: 'R2_ACCESS_KEY' },
  { search: /R2_SECRET_KEY/g, replace: 'R2_SECRET_KEY' },
  { search: /storageClient/g, replace: 'storageClient' },
  { search: /lib\/cloudflare/g, replace: 'lib/storage' },
  { search: /Cloudflare R2/g, replace: 'Cloudflare R2' },
  { search: /cloudflare/g, replace: 'cloudflare' }, // Caution on lowercase, mostly in strings
];

function processFile(filePath) {
  // If it's lib/storage.ts, rename it first then process
  let actualPath = filePath;
  if (filePath.endsWith('lib\\cloudflare.ts') || filePath.endsWith('lib/storage.ts')) {
    const newPath = path.join(path.dirname(filePath), 'storage.ts');
    fs.renameSync(filePath, newPath);
    actualPath = newPath;
    console.log(`Renamed: ${filePath} -> ${newPath}`);
  }

  const content = fs.readFileSync(actualPath, 'utf8');
  let newContent = content;
  let changed = false;

  for (const { search, replace } of REPLACEMENTS) {
    if (search.test(newContent)) {
      newContent = newContent.replace(search, replace);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(actualPath, newContent, 'utf8');
    console.log(`Updated: ${actualPath}`);
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

console.log('Starting Cloudflare R2 replacement...');
processDirectory(process.cwd());
console.log('Finished Cloudflare R2 replacement.');
