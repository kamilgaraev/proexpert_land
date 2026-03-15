import { copyFileSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const [,, clientDirArg] = process.argv;
if (!clientDirArg) {
  console.error('Missing client directory argument');
  process.exit(1);
}

const clientDir = resolve(process.cwd(), clientDirArg);
const distDir = dirname(clientDir);

console.log(`Checking for manifest in: ${clientDir}`);

// Вспомогательная функция для рекурсивного поиска всех json файлов (для отладки)
function findJsonFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    if (lstatSync(filePath).isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const possibleSources = [
  resolve(clientDir, '.vite/manifest.json'),
  resolve(clientDir, 'manifest.json'),
  resolve(clientDir, 'assets.json'),
  resolve(clientDir, '_temp_manifest.json'),
  resolve(distDir, 'client/assets.json')
];

let found = false;
for (const src of possibleSources) {
  if (existsSync(src)) {
    console.log(`Found manifest at: ${src}`);
    const ssrDst = resolve(distDir, 'assets.json');
    copyFileSync(src, ssrDst);
    console.log(`Copied to: ${ssrDst}`);
    
    const clientDst = resolve(clientDir, 'manifest.json');
    if (src !== clientDst) {
        copyFileSync(src, clientDst);
        console.log(`Copied to: ${clientDst}`);
    }
    found = true;
    break;
  }
}

if (!found) {
    console.error('Manifest NOT found in primary locations.');
    console.log('Available JSON files in dist:');
    const allJsons = findJsonFiles(distDir);
    allJsons.forEach(f => console.log(` - ${f}`));
    
    // Попробуем найти любой файл, который выглядит как манифест (содержит много ключей)
    const probableManifest = allJsons.find(f => f.includes('manifest') || f.includes('assets'));
    if (probableManifest) {
        console.log(`Attempting to use probable manifest: ${probableManifest}`);
        copyFileSync(probableManifest, resolve(distDir, 'assets.json'));
        found = true;
    }
}

if (!found) {
    process.exit(1);
}