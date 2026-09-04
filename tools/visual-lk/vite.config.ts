import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { entries: ['tools/visual-lk/index.html'] },
  resolve: {
    alias: [
      { find: '@/hooks/useMyProjects', replacement: fileURLToPath(new URL('./projects.ts', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('../../src', import.meta.url)) },
    ],
  },
  server: { host: '127.0.0.1', port: 4177, strictPort: true },
});
