let backendApiOrigin = import.meta.env.VITE_BACKEND_API_ORIGIN || document.location.origin
if (import.meta.env.VITE_BUILD_LIBS === '1') {
  backendApiOrigin = import.meta.env.VITE_LIBS_BACKEND_API_ORIGIN
}

export const BACKEND_API_ORIGIN = backendApiOrigin
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || null
export const CANONICAL_URL_ORIGIN = import.meta.env.VITE_CANONICAL_URL_ORIGIN || null
export const DEFAULT_DOCUMENT_TITLE = import.meta.env.VITE_DEFAULT_DOCUMENT_TITLE || 'Lightning Tip Cards'
