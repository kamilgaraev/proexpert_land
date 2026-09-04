import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = '3197';
const server = spawn(process.execPath, ['server/index.cjs'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: port },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
let exited = false;
let startupError;
for (const stream of [server.stdout, server.stderr]) {
  stream.on('data', (chunk) => { output = (output + chunk.toString()).slice(-16000); });
}
server.on('exit', () => { exited = true; });
server.on('error', (error) => { startupError = error; });

try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (startupError) throw startupError;
    if (exited) throw new Error(`SSR server exited before readiness.\n${output}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
      await response.text();
      if (response.ok) { ready = true; break; }
    } catch {
      if (exited) throw new Error(`SSR server exited during readiness.\n${output}`);
    }
    await delay(1000);
  }
  if (!ready) throw new Error(`SSR server did not become ready.\n${output}`);

  for (const pathname of ['/', '/features', '/pricing']) {
    const response = await fetch(`http://127.0.0.1:${port}${pathname}`, { signal: AbortSignal.timeout(10000), redirect: 'manual' });
    const html = await response.text();
    if (response.status !== 200 || !/<h1[\s>]/i.test(html) || !/<link[^>]*rel=["']canonical["']/i.test(html)) {
      throw new Error(`SSR contract failed for ${pathname}: HTTP ${response.status}.\n${output}`);
    }
    console.log(`SSR verified: ${pathname}`);
  }
} finally {
  if (!exited) server.kill('SIGTERM');
}
