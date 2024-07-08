import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'frontend/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:5050',
    supportFile: false,
  },
})
