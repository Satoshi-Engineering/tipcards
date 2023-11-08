module.exports = {
  // PM2 Run Configuration
  apps: [
    {
      name: 'lightning-tip-cards-backend',
      script: '-r tsconfig-paths/register ./dist/backend/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
