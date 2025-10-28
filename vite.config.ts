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
        // Улучшенное разделение chunks для оптимальной загрузки
        manualChunks: (id) => {
          // Выносим vendor библиотеки в отдельные chunks
          if (id.includes('node_modules')) {
            // React и связанные библиотеки
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Chart.js в отдельный chunk (тяжелая библиотека)
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            // Framer Motion в отдельный chunk (анимации)
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            // Router в отдельный chunk
            if (id.includes('react-router')) {
              return 'router';
            }
            // Icons в отдельный chunk
            if (id.includes('@heroicons') || id.includes('@headlessui')) {
              return 'ui-libs';
            }
            // Pusher/Echo для WebSocket
            if (id.includes('pusher-js') || id.includes('laravel-echo')) {
              return 'realtime';
            }
            // DnD библиотеки
            if (id.includes('@dnd-kit')) {
              return 'dnd';
            }
            // Остальные vendor библиотеки
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