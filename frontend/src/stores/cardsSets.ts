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

const decodeCardsSetSettings = (settingsEncoded: string): Settings => {
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

const encodeCardsSetSettings = (settingsDecoded: Settings | null | undefined): string => {
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
const setsServer = ref<Set[]>([])
const callbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []
let abortController: AbortController

/**
 * @param sets
 * @throws
 */
const loadSetsFromServer = async () => {
  abortController = new AbortController()
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/`, { signal: abortController.signal })
    setsServer.value = response.data
  } catch (error) {
    if (!axios.isCancel(error)) {
      throw error
    }
  }
}

/////
// store
export const useCardsSetsStore = defineStore('cardsSets', () => {
  const userStore = useUserStore()
  const { isLoggedIn } = storeToRefs(userStore)

  const subscribed = ref(false)
  const fetching = ref(false)
  const userErrorMessages = ref<string[]>([])

  const reload = async () => {
    fetching.value = true
    loadSetsFromlocalStorage()
    try {
      if (isLoggedIn.value) {
        await loadSetsFromServer()
      }
      callbacks.forEach(({ resolve }) => resolve())
    } catch (error) {
      console.error(error)
      userErrorMessages.value.push(t('cardsSets.errors.unableToLoadSetsFromBackend'))
      callbacks.forEach(({ reject }) => reject())
    }
    callbacks.length = 0
    fetching.value = false
  }

  const subscribe = async () => {
    subscribed.value = true
    const promise = new Promise((resolve, reject) => {
      callbacks.push({ resolve, reject })
    })
    if (!fetching.value) {
      reload()
    }
    return promise
  }

  const saveSet = async (set: Set) => {
    if (isLoggedIn.value) {
      // console.log('todo : send to backend')
    } else {
      saveCardsSetToLocalStorage(set)
    }
  }

  const deleteSet = async (id: string) => {
    if (isLoggedIn.value) {
      // console.log('todo : send to backend')
    } else {
      deleteCardsSetFromLocalStorage(id)
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
    if (!fetching.value) {
      reload()
    }
  }, { immediate: true })

  const sets = computed(() => [...setsLocalStorage.value, ...setsServer.value])

  return {
    fetching,
    sets,
    subscribe,
    saveSet,
    deleteSet,
  }
})
