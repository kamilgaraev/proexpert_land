import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const [,, clientDirArg] = process.argv;
if (!clientDirArg) {
  console.error('[copyManifest] usage: node copyManifest.js <clientDir>');
  process.exit(1);
}

const clientDir = resolve(process.cwd(), clientDirArg);
const src = resolve(clientDir, '.vite/manifest.json');
const dst = resolve(clientDir, 'manifest.json');

try {
  if (existsSync(src)) {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    console.log(`[copyManifest] ${src} → ${dst}`);
  } else {
    console.warn(`[copyManifest] source manifest not found at ${src}`);
  }
} catch (e) {
  console.error('[copyManifest] failed:', e);
  process.exit(1);
} 