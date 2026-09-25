import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({
  path: new URL('./e2e/.env.local', import.meta.url).pathname,
  quiet: true,
})

export default defineConfig({
  testDir: './e2e/live-checks',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  outputDir: 'test-results/live-check',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-live-check' }]],
  use: {
    locale: 'en-US',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
