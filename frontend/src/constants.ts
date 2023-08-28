let backendApiOrigin = import.meta.env.VITE_BACKEND_API_ORIGIN || document.location.origin
if (import.meta.env.VITE_BUILD_LIBS === '1') {
  backendApiOrigin = import.meta.env.VITE_LIBS_BACKEND_API_ORIGIN
}

let authOrigin = backendApiOrigin
if (typeof import.meta.env.VITE_TIPCARDS_AUTH_ORIGIN === 'string' && import.meta.env.VITE_TIPCARDS_AUTH_ORIGIN.length > 0) {
  authOrigin = import.meta.env.VITE_TIPCARDS_AUTH_ORIGIN
}

export const BACKEND_API_ORIGIN = backendApiOrigin
export const TIPCARDS_AUTH_ORIGIN = authOrigin
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || null
export const CANONICAL_URL_ORIGIN = import.meta.env.VITE_CANONICAL_URL_ORIGIN || null
export const DEFAULT_DOCUMENT_TITLE = import.meta.env.VITE_DEFAULT_DOCUMENT_TITLE || 'Lightning Tip Cards'
export const TIPCARDS_ORIGIN = import.meta.env.VITE_TIPCARDS_ORIGIN || 'https://tipcards.io'
export const LNBITS_ORIGIN = import.meta.env.VITE_LNBITS_ORIGIN || 'https://legend.lnbits.com'
