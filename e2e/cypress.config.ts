import { defineConfig } from 'cypress'
import { config } from 'dotenv'
import path from 'path'

import webpack from '@cypress/webpack-preprocessor'

const webpackOptions = {
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
    alias: {
      '@shared': path.resolve(process.cwd(), '../shared/src'),
      '@e2e': path.resolve(process.cwd(), './'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
}

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
    supportFile: 'e2e/support/e2e.ts',
    fixturesFolder: 'e2e/support/fixtures',
    setupNodeEvents(on) {

      on('file:preprocessor', webpack({ webpackOptions }))

      // Mute audio for all tests
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
    FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE: process.env.FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE || 'http://localhost:5051',
  },
})
