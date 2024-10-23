import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, type RouteLocation } from 'vue-router'

import type { Set } from '@shared/data/api/Set'
import { SetDto } from '@shared/data/trpc/SetDto'

import useSetSettingsFromUrl from '@/modules/useSetSettingsFromUrl'
import {
  decodeCardsSetSettings,
  encodeCardsSetSettings,
} from '@/stores/cardsSets'

export default () => {
  const route = useRoute()
  const { settings } = useSetSettingsFromUrl()

  onMounted(() => {
    loadSetsFromlocalStorage()
    globalThis.saveCurrentSetToLocalStorage = () => saveCurrentSetToLocalStorage(route, settings)
  })
  onBeforeUnmount(() => {
    globalThis.saveCurrentSetToLocalStorage = () => undefined
  })

  return {
    hasSetsInLocalStorage: computed(() => setsDeprecated.value.length > 0),
    setsDeprecated: computed(() => setsDeprecated.value),
    sets: computed(() => setsDeprecated.value.map(toSetDto)),
    saveSet,
    deleteSet,
    deleteAllSets,
  }
}

//////
// privates
const setsDeprecated = ref<Set[]>([])
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

/**
 * transform deprecated api Set into new SetDto
 */
const toSetDto = (set: Set): SetDto => SetDto.parse({
  id: set.id,
  settings: {
    numberOfCards: set.settings?.numberOfCards,
    cardHeadline: set.settings?.cardHeadline,
    cardCopytext: set.settings?.cardCopytext,
    image: set.settings?.cardsQrCodeLogo,
    name: set.settings?.setName,
    landingPage: set.settings?.landingPage,
  },
  created: new Date(set.created * 1000),
  changed: set.date != null ? new Date(set.date * 1000) : new Date(set.created * 1000),
})

const loadSetsFromlocalStorage = () => {
  try {
    const fromLocalStorage = JSON.parse(localStorage.getItem(SAVED_CARDS_SETS_KEY) || '[]') as SetWithEncodedSettings[]
    setsDeprecated.value = fromLocalStorage.map((set) => toSet(set))
  } catch {
    // do nothing
  }
}

const saveSet = (set: Set) => {
  loadSetsFromlocalStorage()
  const existingIndex = setsDeprecated.value.findIndex(({ id: existingSetId }) => existingSetId === set.id)
  const newSets: SetWithEncodedSettings[] = setsDeprecated.value.map((currentSet) => fromSet(currentSet))
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
  const newSets: SetWithEncodedSettings[] = setsDeprecated.value
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
const saveCurrentSetToLocalStorage = (route: RouteLocation, settings: Set['settings']) => {
  const setId = route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId)
  if (setId == null) {
    throw new Error('No setId on current route!')
  }
  let created = Math.floor(+ new Date() / 1000)
  const currentSet = setsDeprecated.value.find(({ id }) => id === setId)
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
