module.exports = {
  apps: [
    {
      name: 'prohelper-ssr',
      cwd: '/var/www/prohelper_marketing', // рабочая папка на сервере
      script: 'npx',                       // запускаем встроенный preview-сервер vite-plugin-ssr
      args: 'vite-plugin-ssr preview --root dist --port 3001 --production',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}; 