import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type z from 'zod'

import { Type, type LandingPage } from '@shared/data/redis/LandingPage'
import type { Card } from '@shared/data/trpc/Card'
import { encodeLnurl } from '@shared/modules/lnurlHelpers'

import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'

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

  const getLandingPageUrl = (
    cardHash: CardHash,
    type: 'landing' | 'preview',
    landingPageId?: LandingPageId,
  ) => {
    const landingPage = getLandingPage(landingPageId)
    const internalUrl = buildCardInternalUrl(cardHash, type)
    if (!useExternalUrl(landingPage)) {
      return internalUrl
    }

    try {
      return buildCardExternalUrl(cardHash, landingPage as LandingPage, type)
    } catch (error) {
      console.error(error)
      return internalUrl
    }
  }

  const buildCardInternalUrl = (cardHash: CardHash, type: 'landing' | 'preview') => {
    const routeHref = router.resolve({
      name: type,
      params: { lang: route.params.lang },
      query: { lightning: cardDynamicLnurl(cardHash) },
    }).href
    if (type === 'preview') {
      return routeHref
    }
    return `${location.protocol}//${location.host}${routeHref}`
  }
  
  const getLandingPage = (landingPageId?: LandingPageId): LandingPage | undefined => {
    if (landingPagesById.value == null || landingPageId == null) {
      return undefined
    }
    return landingPagesById.value[landingPageId]
  }

  const useExternalUrl = (landingPage?: LandingPage) => landingPage?.type === Type.enum.external && landingPage?.url != null

  const buildCardExternalUrl = (cardHash: CardHash, landingPage: LandingPage, type: 'landing' | 'preview') => {
    const path = new URL(String(landingPage.url))
    path.searchParams.append('lightning', cardDynamicLnurl(cardHash))
    if (type === 'preview') {
      path.searchParams.append('type', 'preview')
    }
    return path.href
  }

  const cardDynamicLnurl = (cardHash: CardHash) => encodeLnurl(`${BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()

  return {
    landingPages,
    landingPagesById,
    getLandingPageUrl,
  }
}
