import axios from 'axios'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, nextTick, watch } from 'vue'

import type { Settings, Set } from '@root/data/Set'

import i18n from '@/modules/initI18n'
import { useUserStore } from '@/stores/user'
import { BACKEND_API_ORIGIN } from '@/constants'

const { t } = i18n.global

export const initialSettings: Settings = {
  numberOfCards: 8,
  cardHeadline: 'Hey :)',
  cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
  cardsQrCodeLogo: 'bitcoin',
  setName: '',
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
  } catch (error) {
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

//////
// localStorage
const setsLocalStorage = ref<Set[]>([])
const SAVED_CARDS_SETS_KEY = 'savedTipCardsSets'

type SetWithEncodedSettings = {
  setId: string
  settings: string
  created?: string // iso string
  date: string // iso string of latest update
}

/**
 * transform Set into SetWithEncodedSettings
 */
const fromSet = (set: Set): SetWithEncodedSettings => {
  let date = new Date().toISOString()
  if (set.date != null) {
    date = new Date(set.date).toISOString()
  }
  let created = date
  if (set.created != null) {
    created = new Date(set.created).toISOString()
  }
  return {
    setId: set.id,
    settings: encodeCardsSetSettings(set.settings),
    created,
    date,
  }
}

/**
 * transform SetWithEncodedSettings into Set
 */
const toSet = (set: SetWithEncodedSettings): Set => {
  let created = Math.floor(+ new Date(set.date) / 1000)
  if (set.created != null) {
    created = Math.floor(+ new Date(set.created) / 1000)
  }
  return {
    id: set.setId,
    settings: decodeCardsSetSettings(set.settings),
    created,
    date: Math.floor(+ new Date(set.date) / 1000),
  }
}

const loadSetsFromlocalStorage = () => {
  try {
    const fromLocalStorage = JSON.parse(localStorage.getItem(SAVED_CARDS_SETS_KEY) || '[]') as SetWithEncodedSettings[]
    setsLocalStorage.value = fromLocalStorage.map((set) => toSet(set))
  } catch (error) {
    // do nothing
  }
}

const saveCardsSetToLocalStorage = (set: Set) => {
  loadSetsFromlocalStorage()
  const existingIndex = setsLocalStorage.value.findIndex(({ id: existingSetId }) => existingSetId === set.id)
  const newSets: SetWithEncodedSettings[] = setsLocalStorage.value.map((currentSet) => fromSet(currentSet))
  if (existingIndex > -1) {
    newSets[existingIndex] = fromSet(set)
  } else {
    newSets.push(fromSet(set))
  }
  localStorage.setItem(SAVED_CARDS_SETS_KEY, JSON.stringify(newSets))
  loadSetsFromlocalStorage()
}

const deleteCardsSetFromLocalStorage = (id: string) => {
  loadSetsFromlocalStorage()
  const newSets: SetWithEncodedSettings[] = setsLocalStorage.value
    .filter((set) => set.id !== id)
    .map((set) => fromSet(set))
  localStorage.setItem(SAVED_CARDS_SETS_KEY, JSON.stringify(newSets))
  loadSetsFromlocalStorage()
}

/////
// server
const fetching = ref(false)
const fetchingUserErrorMessages = ref<string[]>([])
const setsServer = ref<Set[]>([])
let abortController: AbortController

const loadSetsFromServer = async () => {
  if (fetching.value) {
    return
  }
  fetching.value = true
  fetchingUserErrorMessages.value = []
  abortController = new AbortController()
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/`, { signal: abortController.signal })
    setsServer.value = response.data.data
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
  const existingIndex = setsServer.value.findIndex(({ id }) => id === set.id)
  if (existingIndex > -1) {
    setsServer.value[existingIndex] = set
  } else {
    setsServer.value.push(set)
  }

  const response = await axios.post(`${BACKEND_API_ORIGIN}/api/set/${set.id}/`, set)
  if (response.data.status !== 'success') {
    throw response.data
  }

  // refresh asynchronously
  setTimeout(() => {
    try {
      loadSetsFromServer()
    } catch (error) {
      // do nothing as nobody subscribed to this call
    }
  }, 0)
}

const deleteSetFromServer = async (setId: string) => {
  const oldSets = setsServer.value
  setsServer.value = setsServer.value.filter(({ id }) => id !== setId)
  try {
    const response = await axios.delete(`${BACKEND_API_ORIGIN}/api/set/${setId}/`)
    if (response.data.status !== 'success') {
      throw response.data
    }
  } catch (error) {
    setsServer.value = oldSets
    throw error
  } finally {
    // refresh asynchronously
    setTimeout(() => {
      try {
        loadSetsFromServer()
      } catch (error) {
        // do nothing as nobody subscribed to this call
      }
    }, 0)
  }
}

/////
// store
export const useCardsSetsStore = defineStore('cardsSets', () => {
  const userStore = useUserStore()
  const { isLoggedIn } = storeToRefs(userStore)

  const subscribed = ref(false)
  const callbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []

  const reload = async () => {
    loadSetsFromlocalStorage()
    if (!isLoggedIn.value) {
      callbacks.forEach(({ resolve }) => resolve())
      return
    }
    if (fetching.value) {
      return
    }
    try {
      await loadSetsFromServer()
      callbacks.forEach(({ resolve }) => resolve())
    } catch (error) {
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
    } else {
      saveCardsSetToLocalStorage(set)
    }
  }

  /**
   * @throws
   */
  const deleteSet = async (setId: string) => {
    if (isLoggedIn.value) {
      await deleteSetFromServer(setId)
    } else {
      deleteCardsSetFromLocalStorage(setId)
    }
  }

  watch(isLoggedIn, async () => {
    if (!subscribed.value) {
      return
    }
    setsServer.value = []
    if (fetching.value && abortController != null) {
      abortController.abort()
      await nextTick()
    }
    reload()
  }, { immediate: true })

  const sets = computed(() => [...setsLocalStorage.value, ...setsServer.value])
  const hasSetsInLocalStorage = computed(() => setsLocalStorage.value.length > 0)

  return {
    fetching,
    sets,
    subscribe,
    saveSet,
    deleteSet,
    hasSetsInLocalStorage,
    fetchingUserErrorMessages,
  }
})
