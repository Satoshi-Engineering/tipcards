module.exports = {
  // PM2 Run Configuration
  apps: [
    {
      name: 'backend-main',
      script: './dist/backend/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'lightning-tip-cards-backend-develop',
      script: './dist/backend/index.js',
      env: {
      },
    },
  ],
}
