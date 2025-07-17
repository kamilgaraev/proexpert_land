module.exports = {
  apps: [
    {
      name: 'prohelper-ssr',
      cwd: '/var/www/prohelper_marketing', // рабочая папка на сервере
      script: 'server/index.js',           // точка входа vite-plugin-ssr
      args: '--port 3001',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}; 