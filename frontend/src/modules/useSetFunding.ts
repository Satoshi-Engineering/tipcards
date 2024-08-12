import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Set } from '@shared/data/api/Set'

export type Card = {
  cardHash: string,
  urlLandingWithLnurl: string,
  urlLandingWithCardHash: string,
  urlFunding: string,
  lnurl: string,
  status: string | null,
  amount: number | null,
  note: string | null,
  shared: boolean,
  fundedDate: number | null,
  usedDate: number | null,
  createdDate: number | null,
  viewed: boolean,
  qrCodeSvg: string,
}

export default () => {
  const route = useRoute()
  const router = useRouter()

  const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))
  const setFundingHref = computed(() => {
    if (
      setId.value == null
      || (
        route.name !== 'set-funding'
        && route.name !== 'cards'
      )
    ) {
      return ''
    }
    return router.resolve({
      name: 'set-funding',
      params: {
        lang: route.params.lang,
        setId: route.params.setId,
        settings: route.params.settings,
      },
    }).href
  })

  const setFundingDisabled = (cards: Card[], set?: Set) => {
    if (
      set?.invoice != null
      && set.invoice.paid == null
    ) {
      // there is already a (not paid) set-funding invoice, allow the user to view it
      return false
    }

    // there are cards with data, by design no set-funding is allowed
    return cards.filter(({ status }) => status !== 'unfunded').length !== 0
  }

  return {
    setFundingHref,
    setFundingDisabled,
  }
}
