import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { useI18nHelpers } from '@/modules/initI18n'
import { DEFAULT_DOCUMENT_TITLE, CANONICAL_URL_ORIGIN } from '@/constants'

export const useSeoHelpers = () => {
  const route = useRoute()
  const { currentLocale, currentTextDirection } = useI18nHelpers()

  const initHtmlSeoWatchers = () => {
    watch(currentLocale, (value) => {
      document.documentElement.setAttribute('lang', value)
    })

    watch(currentTextDirection, (value) => {
      document.documentElement.setAttribute('dir', value)
    })

    watch(route, () => {
      updateCanonicalUrl()
      setDocumentTitle()
    })
  }

  const updateCanonicalUrl = () => {
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
    setDocumentTitle,
    initHtmlSeoWatchers,
  }
}
