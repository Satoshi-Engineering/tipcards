import { defineConfig } from 'cypress'
import { config } from 'dotenv'

config({
  path: './.env.test',
  override: true, // we want to make sure that our configured values are always used
})

config({
  path: './.env.test.local',
  override: true, // we want to make sure that our configured values are always used
})

export default defineConfig({
  e2e: {
    specPattern: 'frontend/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    supportFile: false,
  },
  env: {
    TIPCARDS_ORIGIN: process.env.TIPCARDS_ORIGIN || 'http://localhost:5050',
  },
})
