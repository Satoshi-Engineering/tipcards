import axios from 'axios'
import { defineStore, storeToRefs } from 'pinia'
import { ref, nextTick, watch } from 'vue'

import type { Settings, Set } from '@shared/data/api/Set'

import i18n from '@/modules/initI18n'
import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'

const { t } = i18n.global

export const initialSettings: Settings = {
  numberOfCards: 8,
  cardHeadline: 'Hey :)',
  cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
  cardsQrCodeLogo: 'bitcoin',
  setName: '',
  landingPage: 'default',
}

export const getDefaultSettings = (): Settings => ({
  ...initialSettings,
  cardHeadline: t('cards.settings.defaults.cardHeadline'),
  cardCopytext: t('cards.settings.defaults.cardCopytext'),
})

export const decodeCardsSetSettings = (settingsEncoded: string): Settings => {
  let settingsDecoded = {}
  try {
    settingsDecoded = JSON.parse(decodeURIComponent(atob(settingsEncoded)))
  } catch {
    // do nothing
  }
  return {
    ...getDefaultSettings(),
    ...settingsDecoded,
  }
}

export const encodeCardsSetSettings = (settingsDecoded: Settings | null | undefined): string => {
  if (settingsDecoded == null) {
    return btoa(encodeURIComponent(JSON.stringify({
      ...getDefaultSettings(),
    })))
  }
  return btoa(encodeURIComponent(JSON.stringify({
    ...getDefaultSettings(),
    ...settingsDecoded,
  })))
}

/////
// server
const fetching = ref(false)
const fetchingUserErrorMessages = ref<string[]>([])
const sets = ref<Set[]>([])
let abortController: AbortController

const loadSets = async () => {
  if (fetching.value) {
    return
  }
  fetching.value = true
  fetchingUserErrorMessages.value = []
  abortController = new AbortController()
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/`, { signal: abortController.signal })
    sets.value = response.data.data
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error(error)
      fetchingUserErrorMessages.value.push(t('stores.cardsSets.errors.unableToLoadSetsFromBackend'))
      throw error
    }
  } finally {
    fetching.value = false
  }
}

const saveSetToServer = async (set: Set) => {
  const oldSets = sets.value
  const existingIndex = sets.value.findIndex(({ id }) => id === set.id)
  if (existingIndex > -1) {
    sets.value[existingIndex] = set
  } else {
    sets.value.push(set)
  }
  try {
    const response = await axios.post(`${BACKEND_API_ORIGIN}/api/set/${set.id}/`, set)
    if (response.data.status !== 'success') {
      throw response.data
    }
  } catch (error) {
    sets.value = oldSets
    throw error
  } finally {
    // refresh asynchronously
    setTimeout(() => {
      try {
        loadSets()
      } catch {
        // do nothing as nobody subscribed to this call
      }
    }, 0)
  }
}

const deleteSetFromServer = async (setId: string) => {
  const oldSets = sets.value
  sets.value = sets.value.filter(({ id }) => id !== setId)
  try {
    const response = await axios.delete(`${BACKEND_API_ORIGIN}/api/set/${setId}/`)
    if (response.data.status !== 'success') {
      throw response.data
    }
  } catch (error) {
    sets.value = oldSets
    throw error
  } finally {
    // refresh asynchronously
    setTimeout(() => {
      try {
        loadSets()
      } catch {
        // do nothing as nobody subscribed to this call
      }
    }, 0)
  }
}

/////
// store
export const useCardsSetsStore = defineStore('cardsSets', () => {
  const authStore = useAuthStore()
  const { isLoggedIn } = storeToRefs(authStore)

  const subscribed = ref(false)
  const callbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []

  const reload = async () => {
    if (!isLoggedIn.value) {
      callbacks.forEach(({ resolve }) => resolve())
      return
    }
    if (fetching.value) {
      return
    }
    try {
      await loadSets()
      callbacks.forEach(({ resolve }) => resolve())
    } catch {
      callbacks.forEach(({ reject }) => reject())
    } finally {
      callbacks.length = 0
    }
  }

  const subscribe = async () => {
    subscribed.value = true
    const promise = new Promise((resolve, reject) => {
      callbacks.push({ resolve, reject })
    })
    reload()
    return promise
  }

  /**
   * @throws
   */
  const saveSet = async (set: Set) => {
    if (isLoggedIn.value) {
      await saveSetToServer(set)
    }
  }

  /**
   * @throws
   */
  const deleteSet = async (setId: string) => {
    if (isLoggedIn.value) {
      await deleteSetFromServer(setId)
    }
  }

  watch(isLoggedIn, async () => {
    if (!subscribed.value) {
      return
    }
    sets.value = []
    if (fetching.value && abortController != null) {
      abortController.abort()
      await nextTick()
    }
    reload()
  }, { immediate: true })

  return {
    fetching,
    fetchingUserErrorMessages,
    sets,
    subscribe,
    saveSet,
    deleteSet,
  }
})
