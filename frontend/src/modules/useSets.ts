import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SetDto } from '@shared/data/trpc/SetDto.js'
import { SetCardsInfoDto } from '@shared/data/trpc/SetCardsInfoDto.js'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import type { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto'

export type SetCardsInfoWithStatus = { cardsInfo?: SetCardsInfoDto, status: 'loading' | 'error' | 'success' }

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

  /** @returns null if cardsInfo cannot be retrieved */
  const getCardsInfoForSet = async (setId: SetDto['id']): Promise<SetCardsInfoWithStatus> => {
    try {
      return {
        cardsInfo: await set.getCardsInfoBySetId.query(setId),
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
  const fetchingCardsInfo = ref(false)
  const fetchingUserErrorMessages = ref<string[]>([])

  return {
    fetchingUserErrorMessages: computed(() => fetchingUserErrorMessages.value),
    fetchingAllSets,
    fetchingCardsInfo,
    getAllSets,
    getCardsInfoForSet,
    encodeCardsSetSettings,
  }
}
