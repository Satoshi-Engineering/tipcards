import { computed } from 'vue'
import { useRoute } from 'vue-router'

import LNURL from '@shared/modules/LNURL/LNURL'

import { cardHashFromLnurl } from '@/modules/lnurlHelpers'
import { BACKEND_API_ORIGIN } from '@/constants'


export const useCardHashFromRoute = () => {
  const route = useRoute()

  const cardHash = computed<string | null>(() => {
    if (typeof route.params.cardHash === 'string' && route.params.cardHash.length > 0) {
      return route.params.cardHash
    }
    if (typeof route.query.lightning === 'string' && route.query.lightning.length > 0) {
      return cardHashFromLnurl(route.query.lightning)
    }
    return null
  })

  const lnurl = computed<string | null>(() => {
    if (typeof route.params.cardHash === 'string' && route.params.cardHash.length > 0) {
      return LNURL.encode(`${BACKEND_API_ORIGIN}/api/lnurl/${route.params.cardHash}`)
    }
    if (typeof route.query.lightning === 'string' && route.query.lightning.length > 0) {
      return route.query.lightning
    }
    return null
  })

  return { cardHash, lnurl }
}
