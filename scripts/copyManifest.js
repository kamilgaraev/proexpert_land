import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const [,, clientDirArg] = process.argv;
if (!clientDirArg) {
  process.exit(1);
}

const clientDir = resolve(process.cwd(), clientDirArg);
const src = resolve(clientDir, '.vite/manifest.json');
const dst = resolve(clientDir, 'manifest.json');

try {
  if (existsSync(src)) {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
} catch (e) {
  process.exit(1);
} 