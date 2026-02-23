module.exports = {
  apps: [{
    name: 'kladovka78-api',
    script: 'dist/index.js',
    cwd: '/var/www/kladovka78/server',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    // Auto-restart
    watch: false,
    max_memory_restart: '500M',
    // Logs
    error_file: '/var/log/kladovka78/error.log',
    out_file: '/var/log/kladovka78/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
  }],
};
