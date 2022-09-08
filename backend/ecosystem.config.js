module.exports = {
  // PM2 Run Configuration
  apps: [
    {
      name: 'backend-main',
      script: './build/backend/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'lightning-tip-cards-backend-develop',
      script: './build/backend/index.js',
      env: {
      },
    },
  ],
}
