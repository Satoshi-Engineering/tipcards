import { cardHashFromLnurl } from '@/modules/lnurlHelpers'
import { loadCard, getCardStatusForCard } from '@/modules/loadCardStatus'
import useTRpc from '@/modules/useTRpcBase'
import { TIPCARDS_ORIGIN } from '@/constants'

const callables: CallableFunction[] = []

export const subscribe = (callable: CallableFunction) => {
  callables.push(callable)
  init()
}

const init = () => {
  let cardHash: string | null
  if (isViewedFromQrCodeScan()) {
    cardHash = loadCardHashFromLnurl()
    setLandingPageViewed(cardHash)
  } else {
    cardHash = loadCardHashFromGetParameter()
  }
  if (cardHash == null) {
    console.warn('TipCards external card status: No card hash in searchParams found!')
    return
  }
  loadCardStatusInternal(cardHash)
}

const isViewedFromQrCodeScan = () => new URL(location.href).searchParams.has('lightning')

const loadCardHashFromLnurl = () => {
  const lnurl = new URL(location.href).searchParams.get('lightning')
  if (lnurl == null) {
    return null
  }
  return cardHashFromLnurl(lnurl)
}

const setLandingPageViewed = (cardHash: string | null) => {
  if (cardHash == null) {
    return
  }
  const trpc = useTRpc()
  trpc.card.landingPageViewed.mutate({ hash: cardHash })
}

const loadCardHashFromGetParameter = () => new URL(location.href).searchParams.get('cardHash')

const loadCardStatusInternal = async (cardHash: string) => {
  try {
    const card = await loadCard(cardHash)
    const status = getCardStatusForCard(card)
    if (!['funded', 'withdrawPending', 'recentlyWithdrawn', 'withdrawn'].includes(status.status)) {
      const tipcardsUrl = new URL(TIPCARDS_ORIGIN)
      tipcardsUrl.pathname = `/funding/${cardHash}`
      location.href = tipcardsUrl.href
      return
    }

    callables.forEach((callable) => callable({
      status: 'success',
      data: status,
    }))
  } catch (error) {
    callables.forEach((callable) => callable({
      status: 'error',
      data: error,
    }))
  } finally {
    setTimeout(() => loadCardStatusInternal(cardHash), 1000)
  }
}
