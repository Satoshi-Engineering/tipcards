import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: new URL('./e2e-playwright/.env', import.meta.url).pathname })

export default defineConfig({
  testDir: './e2e-playwright',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    clientCertificates: [{
      origin: 'https://tipcards.localhost',
      certPath: './scripts/docker/nginx/certs/tipcards.localhost.crt',
      keyPath: './scripts/docker/nginx/certs/tipcards.localhost.key',
    },{
      origin: 'https://auth.tipcards.localhost',
      certPath: './scripts/docker/nginx/certs/auth.tipcards.localhost.crt',
      keyPath: './scripts/docker/nginx/certs/auth.tipcards.localhost.key',
    },{
      origin: 'https://lnbits.tipcards.localhost',
      certPath: './scripts/docker/nginx/certs/lnbits.tipcards.localhost.crt',
      keyPath: './scripts/docker/nginx/certs/lnbits.tipcards.localhost.key',
    }],
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://tipcards.localhost',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
