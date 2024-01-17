module.exports = {
  // PM2 Run Configuration
  apps: [
    {
      name: 'lightning-tip-cards-backend',
      script: './backend/index.js',
      exp_backoff_restart_delay: 1000,
      node_args: '-r tsconfig-paths/register',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
