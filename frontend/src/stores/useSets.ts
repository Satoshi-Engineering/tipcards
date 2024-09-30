import { computed, ref } from 'vue'

import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'

import i18n from '@/modules/initI18n'
import { useAuthStore } from '@/stores/auth'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import type { SetSettingsDto } from '@shared/data/trpc/tipcards/SetSettingsDto'

const sets = ref<SetDto[]>([])
const fetching = ref(false)
const fetchingUserErrorMessages = ref<string[]>([])

const getAllSets = async () => {
  fetching.value = true
  fetchingUserErrorMessages.value.length = 0
  try {
    sets.value = await set.getAll.query()
  } catch(error) {
    if (!isTRpcClientAbortError(error)) {
      console.error(error)
      fetchingUserErrorMessages.value.push(t('stores.cardsSets.errors.unableToLoadSetsFromBackend'))
      if (error instanceof Error) {
        fetchingUserErrorMessages.value.push(error.message)
      }
    }
  } finally {
    fetching.value = false
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

const { t } = i18n.global
const authStore = useAuthStore()
const { getValidAccessToken } = authStore
const { set } = useTRpc(getValidAccessToken)

export default () => ({
  sets: computed(() => sets.value),
  fetching,
  fetchingUserErrorMessages,
  getAllSets,
  encodeCardsSetSettings,
})
