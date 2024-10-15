import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared/src', import.meta.url)),
      '@backend': fileURLToPath(new URL('./src', import.meta.url)),
      '@auth': fileURLToPath(new URL('./src/auth', import.meta.url)),
    },
  },
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
