import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export type CardsSummaryWithLoadingStatus = { cardsSummary?: CardsSummaryDto, status: 'loading' | 'error' | 'success' | undefined }
export type CardsSummaryWithLoadingStatusBySetId = Record<SetDto['id'], CardsSummaryWithLoadingStatus>

const setsInternal = ref<SetDto[]>([])
const cardsSummaryWithStatusBySetId = ref<CardsSummaryWithLoadingStatusBySetId>({})

export default (limit?: number) => {
  const { t } = useI18n()
  const { set } = useTRpc()
  const fetchingAllSets = ref(false)
  const fetchingCardsSummary = ref(false)
  const fetchingUserErrorMessages = ref<string[]>([])

  const sets = computed<SetDto[]>(() => {
    if (limit != null) {
      return setsInternal.value.slice(0, limit)
    }
    return setsInternal.value
  })

  /** @throws */
  const loadAllSets = async () => {
    fetchingUserErrorMessages.value.length = 0
    fetchingAllSets.value = true
    try {
      setsInternal.value = await set.getLatestChanged.query({ limit })
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

  const { isLoggedIn } = storeToRefs(useAuthStore())

  watch(isLoggedIn, async (isLoggedIn) => {
    if (!isLoggedIn) {
      resetSetsAndCardsSummary()
      return
    }
    await loadAllSets()
  }, { immediate: true })

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

  return {
    fetchingUserErrorMessages,
    fetchingAllSets,
    fetchingCardsSummary,
    sets,
    cardsSummaryWithStatusBySetId,
    loadCardsSummaryForSet,
  }
}
