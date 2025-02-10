/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_API_ORIGIN: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
