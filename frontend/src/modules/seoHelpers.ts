import { useRoute } from 'vue-router'

import i18n from '@/modules/initI18n'
import { DEFAULT_DOCUMENT_TITLE, CANONICAL_URL_ORIGIN } from '@/constants'

export const useSeoHelpers = () => {
  const route = useRoute()

  const setHeaderSeo = () => {
    document.documentElement.setAttribute('lang', i18n.global.locale.value)
    if (CANONICAL_URL_ORIGIN != null) {
      document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', `${CANONICAL_URL_ORIGIN}${route.fullPath}`)
    }
  }

  const setDocumentTitle = (title: string | undefined = undefined) => {
    let titlePrefix
    if (title == null && typeof route.meta.title === 'function') {
      titlePrefix =  route.meta.title()
    } else {
      titlePrefix = title
    }
    if (titlePrefix === false) {
      return
    }
    document.title = typeof titlePrefix === 'string' && titlePrefix.length > 0 ? `${titlePrefix} – ${DEFAULT_DOCUMENT_TITLE}` : DEFAULT_DOCUMENT_TITLE
  }

  return {
    setHeaderSeo,
    setDocumentTitle,
  }
}
