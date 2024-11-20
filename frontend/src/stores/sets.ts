import { computed, ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import i18n from '@/modules/initI18n'
import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'

export type CardsSummaryWithLoadingStatus = { cardsSummary?: CardsSummaryDto, status: 'loading' | 'error' | 'success' | undefined }
export type CardsSummaryWithLoadingStatusBySetId = Record<SetDto['id'], CardsSummaryWithLoadingStatus>

export const useSetsStore = defineStore('sets', () => {
  // I tried to use `useI18n` instead, but then the unit tests failed to initialize the i18n module
  const { t } = i18n.global

  const { set } = useTRpc()

  const limit = ref<number | undefined>()
  const setsInternal = ref<SetDto[]>([])
  const cardsSummaryWithStatusBySetId = ref<CardsSummaryWithLoadingStatusBySetId>({})
  const fetchingAllSets = ref(false)
  const fetchingCardsSummary = ref(false)
  const fetchingUserErrorMessages = ref<string[]>([])

  const sets = computed<SetDto[]>(() => {
    if (limit.value != null) {
      return setsInternal.value.slice(0, limit.value)
    }
    return setsInternal.value
  })

  /** @throws */
  const fetchSets = async () => {
    fetchingUserErrorMessages.value.length = 0
    fetchingAllSets.value = true
    try {
      setsInternal.value = await set.getLatestChanged.query({ limit: limit.value })
      resetCardsSummaries()
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
        fetchingUserErrorMessages.value.push(t('stores.cardsSets.errors.unableToLoadSetsFromBackend'))
        if (error instanceof Error) {
          fetchingUserErrorMessages.value.push(error.message)
        }
      }
      throw error
    } finally {
      fetchingAllSets.value = false
    }
  }

  const resetSetsAndCardsSummary = () => {
    setsInternal.value = []
    cardsSummaryWithStatusBySetId.value = {}
  }

  const resetCardsSummaries = () => {
    Object.keys(cardsSummaryWithStatusBySetId.value).forEach((setId) => {
      cardsSummaryWithStatusBySetId.value[setId] = {
        ...cardsSummaryWithStatusBySetId.value[setId],
        status: undefined,
      }
    })
  }

  const loadCardsSummaryForSet = async (setId: string) => {
    if (cardsSummaryWithStatusBySetId.value[setId]?.status != null) {
      return
    }

    setStatusLoadingForSet(setId)
    const cardsSummaryWithStatus = await getCardsSummaryForSet(setId)
    setLoadedCardsSummaryForSet(setId, cardsSummaryWithStatus)
  }

  const setStatusLoadingForSet = (setId: string) => {
    cardsSummaryWithStatusBySetId.value = {
      ...cardsSummaryWithStatusBySetId.value,
      [setId]: {
        ...cardsSummaryWithStatusBySetId.value[setId],
        status: 'loading',
      },
    }
  }

  const setLoadedCardsSummaryForSet = (setId: string, cardsSummaryWithStatus: CardsSummaryWithLoadingStatus) => {
    cardsSummaryWithStatusBySetId.value = {
      ...cardsSummaryWithStatusBySetId.value,
      [setId]: cardsSummaryWithStatus,
    }
  }

  /** @returns null if cardsSummary cannot be retrieved */
  const getCardsSummaryForSet = async (setId: SetDto['id']): Promise<CardsSummaryWithLoadingStatus> => {
    try {
      return {
        cardsSummary: await set.getCardsSummaryBySetId.query(setId),
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

  const { isLoggedIn } = storeToRefs(useAuthStore())

  const loadSets = async () => {
    if (!isLoggedIn) {
      resetSetsAndCardsSummary()
      return
    }
    await fetchSets()
  }

  watch(isLoggedIn, loadSets)

  return {
    limit,
    fetchingUserErrorMessages,
    fetchingAllSets,
    fetchingCardsSummary,
    sets,
    cardsSummaryWithStatusBySetId,
    loadSets,
    loadCardsSummaryForSet,
  }
})
