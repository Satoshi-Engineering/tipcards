import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  let build: Record<string, string | object> = {
    input: {
      'index': resolve(__dirname, 'index.html'),
    },
    outDir: '../dist/frontend/',
    commonjsOptions: { include: [/shared/, /node_modules/] },
  }

  if (env.BUILD_MAINTENANCE) {
    build = {
      input: {
        'maintenance': resolve(__dirname, 'index.maintenance.html'),
      },
    }
  }
  if (env.VITE_BUILD_LIBS) {
    build = {
      lib: {
        entry: resolve(__dirname, 'src/lib/externalCardStatus.ts'),
        name: 'externalCardStatus',
        fileName: 'externalCardStatus',
      },
      outDir: '../dist/frontend/',
    }
  }

  return {
    plugins: [vue(), createHtmlPlugin({ inject: { data: { env } } })],
    optimizeDeps: {
      include: [ 'shared' ],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../shared/src', import.meta.url)),
        '@backend': fileURLToPath(new URL('../backend/src', import.meta.url)),
        'crypto': './src/shims/crypto.ts',
      },
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    build,
  }
})
