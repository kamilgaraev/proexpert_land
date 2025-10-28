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
  define: {
    '$': 'undefined',
    'jQuery': 'undefined',
    'window.$': 'undefined',
    'window.jQuery': 'undefined',
    'global.$': 'undefined',
    'global.jQuery': 'undefined'
  },
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
      // алиасы на react-router больше не нужны — Vite берёт ESM-entry из поля "module"
    },
  },
  // Делает ссылки в HTML вида "/assets/…" вместо относительных "assets/…",
  // чтобы при переходе на вложенные маршруты (/blog) браузер не запрашивал /blog/assets/…
  base: '/',
  build: {
    manifest: 'manifest.json',
    // Включаем минификацию
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удаляем console.log в продакшене
        drop_debugger: true,
      },
    },
    // Увеличиваем лимит для chunk warning
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Минимальная стратегия chunking - выносим только тяжелые библиотеки
        // React и зависимые библиотеки оставляем Vite на автоматическую обработку
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Используем более точные проверки с полными путями
            const nodeModulesPath = id.split('node_modules/')[1];
            if (!nodeModulesPath) return;
            
            const packageName = nodeModulesPath.split('/')[0];
            
            // React экосистема - ДОЛЖНА быть в одном chunk
            if (
              packageName === 'react' || 
              packageName === 'react-dom' || 
              packageName === 'scheduler' ||
              packageName === 'react-router' ||
              packageName === 'react-router-dom' ||
              packageName.startsWith('@remix-run')
            ) {
              return 'react-vendor';
            }
            
            // Тяжелые библиотеки выносим отдельно
            if (packageName === 'chart.js' || packageName === 'react-chartjs-2') {
              return 'charts';
            }
            
            if (packageName === 'framer-motion') {
              return 'animations';
            }
            
            if (packageName === '@heroicons' || packageName === '@headlessui') {
              return 'ui-libs';
            }
            
            if (packageName === 'pusher-js' || packageName === 'laravel-echo') {
              return 'realtime';
            }
            
            // Все остальное в vendor
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // Не даём commonjs-плагину повторно обрабатывать чистые ESM-модули
    // react-router*, иначе он падает с ошибкой «Failed to resolve entry».
    commonjsOptions: {
      exclude: [/react-router/, /react-router-dom/]
    },
  }
}); 