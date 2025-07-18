declare module 'vite-plugin-ssr/plugin' {
  import type { Plugin } from 'vite';
  const plugin: () => Plugin;
  export default plugin;
} 