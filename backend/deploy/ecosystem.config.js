export default {
  // PM2 Run Configuration
  apps: [
    {
      name: 'lightning-tip-cards-backend',
      script: './backend/index.js',
      node_args: '-r tsconfig-paths/register',
      env: {
        NODE_ENV: 'production',
      },
      exp_backoff_restart_delay: 100,
      max_restarts: 35,
      min_uptime: 60 * 60 * 1000,
      wait_ready: true,
    },
  ],
}
