module.exports = {
  apps: [
    {
      name: 'prohelper-ssr',
      cwd: '/var/www/prohelper_marketing/current',
      script: 'server/index.cjs',
      args: '--port 3001',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
