import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig(
  (configEnv) => mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        environment: 'jsdom',
        root: fileURLToPath(new URL('./', import.meta.url)),
      },
    }),
  ),
)
