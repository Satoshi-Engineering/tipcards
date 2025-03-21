import { ref, watch, type WatchHandle } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { SetDto } from '@shared/data/trpc/SetDto.js'

import type { CardsSummaryWithLoadingStatus, CardsSummaryWithLoadingStatusBySetId } from '@/data/CardsSummaryWithLoadingStatus'
import i18n from '@/modules/initI18n'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'

export const useSetsStore = defineStore('sets', () => {
  const sets = ref<SetDto[]>([])
  const cardsSummaryWithStatusBySetId = ref<CardsSummaryWithLoadingStatusBySetId>({})
  const fetchingAllSets = ref(false)
  const fetchingAllSetsUserErrorMessages = ref<string[]>([])

  const loadSets = async () => {
    if (isLoggedIn.value !== true) {
      clearSetsAndCardsSummary()
      return
    }
    resetCardsSummaryLoadingStatuses()
    await fetchSets()
  }

  const subscribeToLoggedInChanges = () => {
    unwatch = watch(isLoggedIn, loadSets)
  }

  const unsubscribeFromLoggedInChanges = () => {
    unwatch()
  }

  const loadCardsSummaryForSet = async (setId: string) => {
    if (
      cardsSummaryWithStatusBySetId.value[setId] != null
      && cardsSummaryWithStatusBySetId.value[setId]?.status !== 'notLoaded'
      && cardsSummaryWithStatusBySetId.value[setId]?.status !== 'needsReload'
    ) {
      return
    }

    setStatusLoadingForSet(setId)
    const cardsSummaryWithStatus = await fetchCardsSummaryForSet(setId)
    setLoadedCardsSummaryForSet(setId, cardsSummaryWithStatus)
  }


  // I tried to use `useI18n` instead, but then the unit tests failed to initialize the i18n module
  const { t } = i18n.global
  const { set } = useTRpc()
  const { isLoggedIn } = storeToRefs(useAuthStore())
  let unwatch: WatchHandle

  const clearSetsAndCardsSummary = () => {
    sets.value = []
    cardsSummaryWithStatusBySetId.value = {}
  }

  const fetchSets = async () => {
    fetchingAllSetsUserErrorMessages.value.length = 0
    fetchingAllSets.value = true
    try {
      const fetchedSets = await set.getAll.query()
      if (isLoggedIn.value === true) {
        sets.value = fetchedSets
      }
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
        fetchingAllSetsUserErrorMessages.value.push(t('stores.cardsSets.errors.unableToLoadSetsFromBackend'))
        if (error instanceof Error) {
          fetchingAllSetsUserErrorMessages.value.push(error.message)
        }
      }
      throw error
    } finally {
      fetchingAllSets.value = false
    }
  }

  /** @returns null if cardsSummary cannot be retrieved */
  const fetchCardsSummaryForSet = async (setId: SetDto['id']): Promise<CardsSummaryWithLoadingStatus> => {
    try {
      return {
        cardsSummary: await set.getCardsSummaryForSetId.query(setId),
        status: 'success',
      }
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(`Error for set.getStatisticsBySetId for set ${setId}`, error)
      }
      return {
        status: 'error',
      }
    }
  }

  const setStatusLoadingForSet = (setId: string) => {
    if (cardsSummaryWithStatusBySetId.value[setId]?.cardsSummary != null) {
      cardsSummaryWithStatusBySetId.value = {
        ...cardsSummaryWithStatusBySetId.value,
        [setId]: {
          ...cardsSummaryWithStatusBySetId.value[setId],
          status: 'reloading',
        },
      }
      return
    }
    cardsSummaryWithStatusBySetId.value = {
      ...cardsSummaryWithStatusBySetId.value,
      [setId]: {
        status: 'loading',
      },
    }
  }

  const setLoadedCardsSummaryForSet = (setId: string, cardsSummaryWithStatus: CardsSummaryWithLoadingStatus) => {
    if (isLoggedIn.value !== true) {
      return
    }
    cardsSummaryWithStatusBySetId.value = {
      ...cardsSummaryWithStatusBySetId.value,
      [setId]: cardsSummaryWithStatus,
    }
  }

  const resetCardsSummaryLoadingStatuses = () => {
    cardsSummaryWithStatusBySetId.value = Object.entries(cardsSummaryWithStatusBySetId.value)
      .reduce((acc, [setId, { cardsSummary }]) => {
        if (cardsSummary != null) {
          acc[setId] = {
            cardsSummary,
            status: 'needsReload',
          }
          return acc
        }
        acc[setId] = {
          status: 'notLoaded',
        }
        return acc
      }, {} as CardsSummaryWithLoadingStatusBySetId)
  }

  return {
    sets,
    cardsSummaryWithStatusBySetId,
    fetchingAllSets,
    fetchingAllSetsUserErrorMessages,
    loadSets,
    loadCardsSummaryForSet,
    fetchCardsSummaryForSet,
    subscribeToLoggedInChanges,
    unsubscribeFromLoggedInChanges,
  }
})
