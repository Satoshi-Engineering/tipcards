import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({
  path: new URL('./e2e/.env', import.meta.url).pathname,
  quiet: true,
})

const parallelSafeTag = /@parallel-safe/

export default defineConfig({
  testDir: './e2e',
  testIgnore: 'live-checks/**',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run shared-state tests first, then explicitly tagged tests with two workers. */
  workers: 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
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
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'non-parallel',
      grepInvert: parallelSafeTag,
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'parallel-safe',
      dependencies: ['non-parallel'],
      grep: parallelSafeTag,
      workers: 2,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
