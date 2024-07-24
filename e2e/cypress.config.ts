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
    supportFile: false,
  },
  env: {
    BACKEND_API_ORIGIN: process.env.BACKEND_API_ORIGIN || 'http://localhost:4000',
    TIPCARDS_ORIGIN: process.env.TIPCARDS_ORIGIN || 'http://localhost:5050',
  },
})
