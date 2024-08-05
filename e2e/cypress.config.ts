import { defineConfig } from 'cypress'
import { config } from 'dotenv'

config({
  path: './.env',
  override: true, // we want to make sure that our configured values are always used
})

config({
  path: './.env.local',
  override: true, // we want to make sure that our configured values are always used
})

export default defineConfig({
  e2e: {
    specPattern: 'e2e/**/*.test.ts',
    supportFile: 'e2e/cypress/support/e2e.ts',
    // Mute audio for all tests
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family !== 'chromium') {
          return launchOptions
        }
        if (browser.name == 'electron') {
          launchOptions.preferences.webPreferences.autoplayPolicy = 'user-gesture-required'
        } else {
          launchOptions.args.push('--mute-audio')
        }
        return launchOptions
      })
    },
  },
  env: {
    BACKEND_API_ORIGIN: process.env.BACKEND_API_ORIGIN || 'http://localhost:4000',
    TIPCARDS_ORIGIN: process.env.TIPCARDS_ORIGIN || 'http://localhost:5050',
  },
})
