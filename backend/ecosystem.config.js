module.exports = {
  // PM2 Run Configuration
  apps: [
    {
      name: 'backend-main',
      script: './build/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'backend-develop',
      script: './build/index.js',
      env: {
      },
    },
  ],
}
