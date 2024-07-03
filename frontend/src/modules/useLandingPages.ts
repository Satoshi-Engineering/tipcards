import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type z from 'zod'

import { Type, type LandingPage } from '@shared/data/api/LandingPage'
import type { Card } from '@shared/data/trpc/Card'
import LNURL from '@shared/modules/LNURL/LNURL'

import { useAuthStore } from '@/stores/auth'
import { TIPCARDS_ORIGIN, BACKEND_API_ORIGIN } from '@/constants'

type CardHash = z.infer<typeof Card.shape.hash>
type LandingPageId = z.infer<typeof LandingPage.shape.id>

export default () => {
  const route = useRoute()
  const router = useRouter()

  const { isLoggedIn } = storeToRefs(useAuthStore())

  const landingPages = ref<LandingPage[]>()
  const landingPagesById = computed<Record<string, LandingPage> | undefined>(() => {
    if (landingPages.value == null) {
      return undefined
    }
    return landingPages.value.reduce((landingPages, landingPage) => ({
      ...landingPages,
      [landingPage.id]: landingPage,
    }), {})
  })

  const loadLandingPages = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_ORIGIN}/api/landingPages/`)
      landingPages.value = response.data.data
    } catch (error) {
      console.error(error)
    }
  }
  watchEffect(() => {
    if (isLoggedIn.value) {
      loadLandingPages()
    }
  })

  const getLandingPageUrlWithLnurl = (
    cardHash: CardHash,
    landingPageId?: LandingPageId,
  ) => {
    const landingPage = getLandingPage(landingPageId)
    const internalUrl = buildInternalUrlWithLnurl(cardHash)
    if (landingPage == null || !useExternalUrl(landingPage)) {
      return internalUrl
    }

    try {
      return buildExternalUrlWithLnurl(cardHash, landingPage)
    } catch (error) {
      console.error(error)
      return internalUrl
    }
  }

  const getLandingPageUrlWithCardHash = (
    cardHash: CardHash,
    landingPageId?: LandingPageId,
  ) => {
    const landingPage = getLandingPage(landingPageId)
    const internalUrl = buildInternalUrlWithCardHash(cardHash)
    if (landingPage == null || !useExternalUrl(landingPage)) {
      return internalUrl
    }

    try {
      return buildExternalUrlWithCardHash(cardHash, landingPage)
    } catch (error) {
      console.error(error)
      return internalUrl
    }
  }

  const buildInternalUrlWithLnurl = (cardHash: CardHash) => {
    const routeHref = router.resolve({
      name: 'landing',
      params: { lang: route.params.lang },
      query: { lightning: cardDynamicLnurl(cardHash) },
    }).href
    return `${TIPCARDS_ORIGIN}${routeHref}`
  }

  const buildInternalUrlWithCardHash = (cardHash: CardHash) => {
    const routeHref = router.resolve({
      name: 'landing',
      params: { lang: route.params.lang, cardHash },
    }).href
    return `${TIPCARDS_ORIGIN}${routeHref}`
  }

  const getLandingPage = (landingPageId?: LandingPageId): LandingPage | undefined => {
    if (landingPagesById.value == null || landingPageId == null) {
      return undefined
    }
    return landingPagesById.value[landingPageId]
  }

  const useExternalUrl = (landingPage: LandingPage) => landingPage.type === Type.enum.external && landingPage.url != null

  const buildExternalUrlWithLnurl = (cardHash: CardHash, landingPage: LandingPage) => {
    const path = new URL(String(landingPage.url))
    path.searchParams.append('lightning', cardDynamicLnurl(cardHash))
    return path.href
  }

  const buildExternalUrlWithCardHash = (cardHash: CardHash, landingPage: LandingPage) => {
    const path = new URL(String(landingPage.url))
    path.searchParams.append('cardHash', cardHash)
    return path.href
  }

  const cardDynamicLnurl = (cardHash: CardHash) => LNURL.encode(`${TIPCARDS_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()

  return {
    landingPages,
    landingPagesById,
    getLandingPageUrlWithLnurl,
    getLandingPageUrlWithCardHash,
  }
}
