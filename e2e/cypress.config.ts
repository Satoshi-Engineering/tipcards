import { defineConfig } from 'cypress'
import { config } from 'dotenv'
import path from 'path'

import webpack from '@cypress/webpack-preprocessor'

import setupClipboardy from './plugins/clipboardy.js'
import setupDatabaseTasks from './plugins/database.js'
import setupJwtTasks from './plugins/jwt.js'
import setupLnurlTasks from './plugins/lnurl.js'

const webpackOptions = {
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
    alias: {
      '@backend': path.resolve(process.cwd(), '../backend/src'),
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
    experimentalInteractiveRunEvents: true, // this is allow before:run events to be triggered in interactive mode (needed for database plugin)
    specPattern: 'e2e/**/*.test.ts',
    supportFile: 'e2e/support/e2e.ts',
    fixturesFolder: 'e2e/support/fixtures',
    setupNodeEvents(on, config) {
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

      setupClipboardy(on, config)

      setupDatabaseTasks(on, config)

      setupJwtTasks(on, config)

      setupLnurlTasks(on, config)
    },
  },
  env: {
    BACKEND_API_ORIGIN: process.env.BACKEND_API_ORIGIN || 'http://localhost:4000',
    TIPCARDS_AUTH_ORIGIN: process.env.TIPCARDS_AUTH_ORIGIN || 'http://localhost:4000',
    TIPCARDS_ORIGIN: process.env.TIPCARDS_ORIGIN || 'http://localhost:5050',
    LNBITS_ORIGIN: process.env.LNBITS_ORIGIN || '',
    LNBITS_ADMIN_KEY: process.env.LNBITS_ADMIN_KEY || '',
    FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE: process.env.FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE || 'http://localhost:5051',
  },
})
