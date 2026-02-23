module.exports = {
  apps: [
    {
      name: 'kladovka78-bot',
      script: 'dist/index.js',
      cwd: '/var/www/kladovka78/server/bot',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
