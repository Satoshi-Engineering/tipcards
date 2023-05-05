import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  let input: Record<string, string> = {
    'index': resolve(__dirname, 'index.html'),
  }
  if (env.BUILD_MAINTENANCE) {
    input = {
      'maintenance': resolve(__dirname, 'index.maintenance.html'),
    }
  }

  return {
    plugins: [vue(), createHtmlPlugin({ inject: { data: { env } } })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@root': fileURLToPath(new URL('../src', import.meta.url)),
        'crypto': './src/shims/crypto.ts',
      },
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    build: {
      rollupOptions: {
        input,
      },
    },
  }
})
