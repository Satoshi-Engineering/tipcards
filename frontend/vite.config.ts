import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type BuildOptions } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  let build: BuildOptions = {
    rollupOptions: {
      input: {
        'index': fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('../dist/frontend/', import.meta.url)),
    commonjsOptions: { include: [/shared/, /node_modules/] },
  }

  if (env.BUILD_MAINTENANCE) {
    build = {
      rollupOptions: {
        input: {
          'maintenance': fileURLToPath(new URL('./index.maintenance.html', import.meta.url)),
        },
      },
      emptyOutDir: true,
      outDir: fileURLToPath(new URL('../dist/frontend-maintenance/', import.meta.url)),
    }
  }

  if (env.VITE_BUILD_LIBS) {
    build = {
      lib: {
        entry: fileURLToPath(new URL('./src/lib/externalCardStatus.ts', import.meta.url)),
        name: 'externalCardStatus',
        fileName: 'externalCardStatus',
      },
      // Do not clear, as the library runs in the pipeline right after the "normal" build, and we build one package from the merged files
      emptyOutDir: false,
      outDir: fileURLToPath(new URL('../dist/frontend/', import.meta.url)),
    }
  }

  return {
    root: fileURLToPath(new URL('./', import.meta.url)),
    plugins: [vue(), createHtmlPlugin({ inject: { data: { env } } })],
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
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: fileURLToPath(new URL('./tailwind.config.ts', import.meta.url)),
          }),
          autoprefixer(),
        ],
      },
    },
  }
})
