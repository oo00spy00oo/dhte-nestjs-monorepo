module.exports = {
  apps: [
    {
      name: 'zma-address',
      script: './main.js',
      cwd: '/app',
      max_memory_restart: '4G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      args: [],
      node_args: [
        '--max-old-space-size=4096',
        '--optimize-for-size',
        '--gc-interval=100',
        '--max-semi-space-size=128',
      ],
      env: {
        PM2_GRACEFUL_TIMEOUT: 8000,
        UV_THREADPOOL_SIZE: 16,
      },
      kill_timeout: 8000,
      listen_timeout: 8000,
      shutdown_with_message: true,
      wait_ready: true,
      instance_var: 'INSTANCE_ID',
      automation: false,
    },
  ],
};
