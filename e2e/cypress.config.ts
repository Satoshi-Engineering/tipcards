import { defineConfig } from 'cypress'
import { config } from 'dotenv'
import path from 'path'
import postgres from 'postgres'

import webpack from '@cypress/webpack-preprocessor'

import setupClipboardy from './plugins/clipboardy.js'

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

      on('task', {
        async connectToPostgres({ command, cardHash }) {
          const DB_CREDENTIALS = {
            host: String(process.env.POSTGRES_HOST),
            user: String(process.env.POSTGRES_USER),
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            password: String(process.env.POSTGRES_PASSWORD),
            database: String(process.env.POSTGRES_DB_NAME),
          }
          const sql = postgres(`postgres://${DB_CREDENTIALS.user}:${DB_CREDENTIALS.password}@${DB_CREDENTIALS.host}:${DB_CREDENTIALS.port}/${DB_CREDENTIALS.database}`)

          if (command === 'setCardWithdrawnDateIntoPast') {
            const cardVersion = await sql`
              SELECT "lnurlW" FROM public."CardVersion" WHERE card=${cardHash};
            `
            const lnbitsId = cardVersion[0].lnurlW
            await sql`
              UPDATE public."LnurlW"
              SET withdrawn='2024-01-01 12:00:00+00'
              WHERE "lnbitsId"=${lnbitsId};
            `
          }

          await sql.end()

          return null
        },
      })
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
