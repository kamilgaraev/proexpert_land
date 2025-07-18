module.exports = {
  apps: [
    {
      name: 'prohelper-ssr',
      cwd: '/var/www/prohelper_marketing', // рабочая папка на сервере
      script: 'server/index.js',           // точка входа vite-plugin-ssr (GitHub Actions кладет в server/)
      args: '--port 3001',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}; 