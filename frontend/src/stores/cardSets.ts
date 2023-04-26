import axios from 'axios'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, type Ref } from 'vue'

import type { Settings, Set } from '@root/data/Set'

import i18n from '@/modules/initI18n'
import { useUserStore } from '@/stores/user'
import { BACKEND_API_ORIGIN } from '@/constants'

const { t } = i18n.global

//////
// localStorage
export const SAVED_CARD_SETS_KEY = 'savedTipCardsSets'

type SetEncoded = {
  setId: string
  settings: string
  date: string
}

export const initialSettings = {
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

export const loadSetsFromlocalStorage = (sets: Ref<Set[]>) => {
  try {
    const fromLocalStorage = JSON.parse(localStorage.getItem(SAVED_CARD_SETS_KEY) || '[]') as SetEncoded[]
    sets.value = fromLocalStorage.map((set) => ({
      id: set.setId,
      ...set,
      settings: decodeCardsSetSettings(set.settings),
    }))
  } catch (error) {
    // do nothing
  }
}

/////
// server
export const loadSetsFromBackend = async (sets: Ref<Set[]>) => {
  // console.log('todo : display message to user on error')
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/`)
    sets.value = response.data
  } catch (error) {
    console.error(error)
  }
}

export const useCardSetsStore = defineStore('cardSets', () => {
  const userStore = useUserStore()
  const { isLoggedIn } = storeToRefs(userStore)

  const callbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []
  const fetching = ref(false)
  const setsLocalStorage = ref<Set[]>([])
  const setsServer = ref<Set[]>([])

  const reload = async () => {
    loadSetsFromlocalStorage(setsLocalStorage)
    try {
      if (isLoggedIn.value) {
        await loadSetsFromBackend(setsServer)
      }
    } catch (error) {
      callbacks.forEach(({ reject }) => reject())
    }
    callbacks.forEach(({ resolve }) => resolve())
  }

  const subscribe = async () => {
    const promise = new Promise((resolve, reject) => {
      callbacks.push({ resolve, reject })
    })
    if (fetching.value) {
      return promise
    }
    reload()
    return promise
  }

  const sets = computed(() => [...setsLocalStorage.value, ...setsServer.value])

  return { fetching, subscribe, sets }
})
