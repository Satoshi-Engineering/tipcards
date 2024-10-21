import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'
import { SetCardsInfoDto } from '@shared/data/trpc/tipcards/SetCardsInfoDto.js'
import { useAuthStore } from '@/stores/auth'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import type { SetSettingsDto } from '@shared/data/trpc/tipcards/SetSettingsDto'

export type SetCardsInfoBySetId = Record<SetDto['id'], SetCardsInfoDto | null>

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
  const getCardsInfoForSet = async (setId: SetDto['id']): Promise<SetCardsInfoDto | null> => {
    try {
      return await set.getCardsInfoBySetId.query(setId)
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(`Error for set.getStatisticsBySetId for set ${setId}`, error)
      }
      return null
    }
  }

  /** @throws */
  const getCardsInfoBySetId = async (sets: SetDto[]): Promise<SetCardsInfoBySetId> => {
    fetchingCardsInfo.value = true
    const cardsInfoWithSetId = await Promise.all(sets.map(async ({ id }) => ({
      setId: id,
      cardsInfo: await getCardsInfoForSet(id),
    })))
    fetchingCardsInfo.value = false

    return cardsInfoWithSetId.reduce((acc, { setId, cardsInfo }) => {
      acc[setId] = cardsInfo
      return acc
    }, {} as SetCardsInfoBySetId)
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
  const fetchingCardsInfo = ref(false)
  const fetchingUserErrorMessages = ref<string[]>([])

  return {
    fetchingUserErrorMessages: computed(() => fetchingUserErrorMessages.value),
    fetchingAllSets,
    fetchingCardsInfo,
    getAllSets,
    getCardsInfoForSet,
    getCardsInfoBySetId,
    encodeCardsSetSettings,
  }
}
