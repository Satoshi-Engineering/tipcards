import { cardHashFromLnurl } from '@/modules/lnurlHelpers'
import { loadCard, getCardStatusForCard } from '@/modules/loadCardStatus'
import { TIPCARDS_ORIGIN } from '@/constants'

const callables: CallableFunction[] = []

export const subscribe = (callable: CallableFunction) => {
  const lnurl = new URL(location.href).searchParams.get('lightning')
  if (lnurl == null) {
    throw new Error('Missing get parameter "lightning".')
  }
  const cardHash = cardHashFromLnurl(lnurl)
  if (cardHash == null) {
    throw new Error('Missing card hash in LNURL from get parameter "lightning".')
  }

  callables.push(callable)
  loadCardStatusInternal(cardHash)
}

const loadCardStatusInternal = async (cardHash: string) => {
  if (callables.length === 0) {
    return
  }
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
