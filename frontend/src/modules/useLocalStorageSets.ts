import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, type RouteLocation } from 'vue-router'

import type { Set } from '@shared/data/api/Set'

import useSetSettingsFromUrl from '@/modules/useSetSettingsFromUrl'
import {
  decodeCardsSetSettings,
  encodeCardsSetSettings,
} from '@/stores/cardsSets'

export default () => {
  const route = useRoute()

  onMounted(() => {
    loadSetsFromlocalStorage()
    globalThis.saveCurrentSetToLocalStorage = () => saveCurrentSetToLocalStorage(route)
  })
  onBeforeUnmount(() => {
    globalThis.saveCurrentSetToLocalStorage = () => undefined
  })

  return {
    hasSetsInLocalStorage: computed(() => sets.value.length > 0),
    sets: computed(() => sets.value),
    saveSet,
    deleteSet,
    deleteAllSets,
  }
}

//////
// privates
const { settings } = useSetSettingsFromUrl()
const sets = ref<Set[]>([])
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
    date = new Date(set.date * 1000).toISOString()
  }
  let created = date
  if (set.created != null) {
    created = new Date(set.created * 1000).toISOString()
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
    userId: null,
    text: '',
    note: '',
    invoice: null,
  }
}

const loadSetsFromlocalStorage = () => {
  try {
    const fromLocalStorage = JSON.parse(localStorage.getItem(SAVED_CARDS_SETS_KEY) || '[]') as SetWithEncodedSettings[]
    sets.value = fromLocalStorage.map((set) => toSet(set))
  } catch (error) {
    // do nothing
  }
}

const saveSet = (set: Set) => {
  loadSetsFromlocalStorage()
  const existingIndex = sets.value.findIndex(({ id: existingSetId }) => existingSetId === set.id)
  const newSets: SetWithEncodedSettings[] = sets.value.map((currentSet) => fromSet(currentSet))
  if (existingIndex > -1) {
    newSets[existingIndex] = fromSet(set)
  } else {
    newSets.push(fromSet(set))
  }
  localStorage.setItem(SAVED_CARDS_SETS_KEY, JSON.stringify(newSets))
  loadSetsFromlocalStorage()
}

const deleteSet = (id: string) => {
  loadSetsFromlocalStorage()
  const newSets: SetWithEncodedSettings[] = sets.value
    .filter((set) => set.id !== id)
    .map((set) => fromSet(set))
  localStorage.setItem(SAVED_CARDS_SETS_KEY, JSON.stringify(newSets))
  loadSetsFromlocalStorage()
}

const deleteAllSets = () => {
  localStorage.removeItem(SAVED_CARDS_SETS_KEY)
  loadSetsFromlocalStorage()
}

/**
 * for debugging
 */
const saveCurrentSetToLocalStorage = (route: RouteLocation) => {
  const setId = route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId)
  if (setId == null) {
    throw new Error('No setId on current route!')
  }
  let created = Math.floor(+ new Date() / 1000)
  const currentSet = sets.value.find(({ id }) => id === setId)
  if (currentSet?.created != null) {
    created = currentSet.created
  }
  saveSet({
    id: setId,
    settings,
    date: Math.floor(+ new Date() / 1000),
    created,
    userId: null,
    text: '',
    note: '',
    invoice: null,
  })
}
