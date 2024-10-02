import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'
import { SetStatisticsDto } from '@shared/data/trpc/tipcards/SetStatisticsDto.js'
import { useAuthStore } from '@/stores/auth'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import type { SetSettingsDto } from '@shared/data/trpc/tipcards/SetSettingsDto'

export type SetStatisticsBySetId = Record<SetDto['id'], SetStatisticsDto>

export default () => {
  /** @throws */
  const getAllSets = async (): Promise<SetDto[]> => {
    fetchingUserErrorMessages.value.length = 0
    fetchingAllSets.value = true
    try {
      return await set.getAll.query()
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

  /** @throws */
  const getStatisticsForSet = async (setId: SetDto['id']): Promise<SetStatisticsDto> => {
    fetchingUserErrorMessages.value.length = 0
    try {
      return await set.getStatisticsBySetId.query(setId)
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
        fetchingUserErrorMessages.value.push(t('stores.cardsSets.errors.unableToLoadSetsFromBackend'))
        if (error instanceof Error) {
          fetchingUserErrorMessages.value.push(error.message)
        }
      }
      throw error
    }
  }

  /** @throws */
  const getStatisticsBySetId = async (sets: SetDto[]): Promise<SetStatisticsBySetId> => {
    fetchingStatistics.value = true
    try {
      const statisticsWithSetId = await Promise.all(sets.map(async ({ id }) => ({
        setId: id,
        statistics: await getStatisticsForSet(id),
      })))

      return statisticsWithSetId.reduce((acc, { setId, statistics }) => {
        acc[setId] = statistics
        return acc
      }, {} as SetStatisticsBySetId)
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
      }
      throw error
    } finally {
      fetchingStatistics.value = false
    }
  }


  const encodeCardsSetSettings = (setSettings: SetSettingsDto) => {
    const setSettingsConverted = {
      numberOfCards: setSettings.numberOfCards,
      cardHeadline: setSettings.cardHeadline,
      cardCopytext: setSettings.cardCopytext,
      cardsQrCodeLogo: setSettings.image,
      setName: setSettings.name,
      landingPage: setSettings.landingPage,
    }
    return btoa(encodeURIComponent(JSON.stringify(setSettingsConverted)))
  }

  const { t } = useI18n()
  const authStore = useAuthStore()
  const { getValidAccessToken } = authStore
  const { set } = useTRpc(getValidAccessToken)
  const fetchingAllSets = ref(false)
  const fetchingStatistics = ref(false)
  const fetchingUserErrorMessages = ref<string[]>([])

  return {
    fetchingUserErrorMessages: computed(() => fetchingUserErrorMessages.value),
    fetchingAllSets,
    fetchingStatistics,
    getAllSets,
    getStatisticsBySetId,
    encodeCardsSetSettings,
  }
}
