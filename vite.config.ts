import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore - vite-plugin-ssr типы не публикует для /plugin
import ssr from 'vite-plugin-ssr/plugin';
import path from 'path';

// Если собираем личный кабинет (BUILD_TARGET=lk) — SSR не нужен.
const isLkBuild = process.env.BUILD_TARGET === 'lk';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: isLkBuild ? [react()] : [react(), ssr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      // "react-router" начиная с 6.23.0 публикуется только в ESM и без поля "main".
      // Это ломает rollup-plugin-commonjs внутри Vite 5 (ошибка
      // "[commonjs--resolver] Failed to resolve entry for package \"react-router\""),
      // поэтому явно указываем, какой файл считать точкой входа.
      'react-router': path.resolve(__dirname, './node_modules/react-router/dist/index.js'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom/dist/index.js'),
    },
  },
  build: {
    manifest: 'manifest.json',
    // Не даём commonjs-плагину повторно обрабатывать чистые ESM-модули
    // react-router*, иначе он падает с ошибкой «Failed to resolve entry».
    commonjsOptions: {
      exclude: [/react-router/, /react-router-dom/]
    },
  }
}); 