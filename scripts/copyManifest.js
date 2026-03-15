import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const [,, clientDirArg] = process.argv;
if (!clientDirArg) {
  process.exit(1);
}

const clientDir = resolve(process.cwd(), clientDirArg);
const distDir = dirname(clientDir);

// Possible manifest locations
const possibleSources = [
  resolve(clientDir, '.vite/manifest.json'),
  resolve(clientDir, 'manifest.json'),
  resolve(clientDir, 'assets.json'),
  resolve(clientDir, '_temp_manifest.json')
];

let found = false;
for (const src of possibleSources) {
  if (existsSync(src)) {
    // Copy for SSR (expected at dist/assets.json)
    const ssrDst = resolve(distDir, 'assets.json');
    copyFileSync(src, ssrDst);
    
    // Copy for client (some tools look for manifest.json in client dir)
    const clientDst = resolve(clientDir, 'manifest.json');
    if (src !== clientDst) {
        copyFileSync(src, clientDst);
    }
    
    found = true;
    break;
  }
}

if (!found) {
    process.exit(1);
}