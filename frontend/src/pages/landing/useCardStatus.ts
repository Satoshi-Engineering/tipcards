
import type { Unsubscribable } from '@trpc/server/observable'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CardStatusDto } from '@shared/data/trpc/CardStatusDto'

import isTRpcSubscriptionAvailable from '@/modules/isTRpcSubscriptionAvailable'
import useTRpc from '@/modules/useTRpc'

import { useCardHashFromRoute } from './useCardHashFromRoute'

export const useCardStatus = () => {
  const { t } = useI18n()
  const { card } = useTRpc()
  const { cardHash, lnurl } = useCardHashFromRoute()

  let mounted = false
  let subscription: Unsubscribable
  let pollingTimeout: ReturnType<typeof setTimeout>
  const loadingCardStatus = ref(false)
  const cardStatus = ref<CardStatusDto>()
  const userErrorMessage = ref<string>()

  const subscribe = () => {
    mounted = true

    if (cardHash.value == null) {
      if (lnurl.value != null && lnurl.value !== '') {
        userErrorMessage.value = t('landing.errors.errorInvalidLnurl')
      }
      return
    }

    loadCardStatus(cardHash.value)
  }

  const loadCardStatus = (hash: string) => {
    loadingCardStatus.value = true

    if (isTRpcSubscriptionAvailable()) {
      startSubscription(hash)
    } else {
      loadCardStatusPolling(hash)
    }
  }

  const startSubscription = (hash: string) => {
    subscription = card.statusSubscription.subscribe(
      { hash },
      {
        onStarted: () => {
          document.body.dataset.testCardStatusSubscription = 'started'
        },
        onData: (data) => {
          loadingCardStatus.value = false
          cardStatus.value = data
        },
        onError: (error) => {
          console.error(error)
          userErrorMessage.value = t('landing.errors.errorInvalidLnurl')
        },
      },
    )
  }

  const loadCardStatusPolling = async (hash: string) => {
    if (!mounted) {
      return
    }
    document.body.dataset.testCardStatusSubscription = 'started'

    try {
      cardStatus.value = await card.status.query({ hash })
    } catch (error) {
      console.error(error)
      userErrorMessage.value = t('landing.errors.errorInvalidLnurl')
    } finally {
      loadingCardStatus.value = false
    }

    pollingTimeout = setTimeout(() => loadCardStatusPolling(hash), 5000)
  }

  const cleanupSubscription = () => {
    subscription?.unsubscribe()
    clearTimeout(pollingTimeout)
    delete document.body.dataset.testCardStatusSubscription
  }

  onMounted(() => {
    mounted = true
    subscribe()
  })
  onBeforeUnmount(() => {
    mounted = false
    cleanupSubscription()
  })

  return {
    cardStatus,
    userErrorMessage,
  }
}
