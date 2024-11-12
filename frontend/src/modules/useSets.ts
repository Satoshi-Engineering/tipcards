import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import type { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto'

export type CardsSummaryWithLoadingStatus = { cardsSummary?: CardsSummaryDto, status: 'loading' | 'error' | 'success' }

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
  const { set } = useTRpc()
  const fetchingAllSets = ref(false)
  const fetchingCardsSummary = ref(false)
  const fetchingUserErrorMessages = ref<string[]>([])

  return {
    fetchingUserErrorMessages: computed(() => fetchingUserErrorMessages.value),
    fetchingAllSets,
    fetchingCardsSummary,
    getAllSets,
    getCardsSummaryForSet,
    encodeCardsSetSettings,
  }
}
