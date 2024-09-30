let backendApiOrigin = import.meta.env.VITE_BACKEND_API_ORIGIN || document.location.origin
if (import.meta.env.VITE_BUILD_LIBS === '1') {
  backendApiOrigin = import.meta.env.VITE_LIBS_BACKEND_API_ORIGIN
}

let authOrigin = backendApiOrigin
if (typeof import.meta.env.VITE_TIPCARDS_AUTH_ORIGIN === 'string' && import.meta.env.VITE_TIPCARDS_AUTH_ORIGIN.length > 0) {
  authOrigin = import.meta.env.VITE_TIPCARDS_AUTH_ORIGIN
}

let tipcardsOrigin = import.meta.env.VITE_TIPCARDS_ORIGIN || 'https://tipcards.io'

if (typeof import.meta.env.VITE_NGROK_OVERRIDE === 'string' && import.meta.env.VITE_NGROK_OVERRIDE.length > 0) {
  backendApiOrigin = import.meta.env.VITE_NGROK_OVERRIDE
  authOrigin = import.meta.env.VITE_NGROK_OVERRIDE
  tipcardsOrigin = import.meta.env.VITE_NGROK_OVERRIDE
}

export const BACKEND_API_ORIGIN = backendApiOrigin
export const TIPCARDS_AUTH_ORIGIN = authOrigin
export const TIPCARDS_ORIGIN = tipcardsOrigin
export const CANONICAL_URL_ORIGIN = import.meta.env.VITE_CANONICAL_URL_ORIGIN || null
export const DEFAULT_DOCUMENT_TITLE = import.meta.env.VITE_DEFAULT_DOCUMENT_TITLE || 'Lightning TipCards'
export const LNBITS_ORIGIN = import.meta.env.VITE_LNBITS_ORIGIN || 'https://legend.lnbits.com'

export const LINK_PRIVACY_POLICY = import.meta.env.VITE_LINK_PRIVACY_POLICY || undefined
export const LINK_LEGAL_NOTICE = import.meta.env.VITE_LINK_LEGAL_NOTICE || undefined
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || undefined
export const LINK_LINKED_IN = import.meta.env.VITE_LINK_LINKED_IN || undefined
export const LINK_X = import.meta.env.VITE_LINK_X || undefined
export const LINK_INSTAGRAM = import.meta.env.VITE_LINK_INSTAGRAM || undefined
export const LIGHTNING_NODE_NAME = import.meta.env.VITE_LIGHTNING_NODE_NAME || undefined
export const LIGHTNING_NODE_LINK = import.meta.env.VITE_LIGHTNING_NODE_LINK || undefined
export const GITHUB_LINK = 'https://github.com/Satoshi-Engineering/tipcards'
