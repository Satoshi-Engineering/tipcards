import { ref } from 'vue'

import i18n from './initI18n'

const { t } = i18n.global

export const SAVED_CARD_SETS_KEY = 'savedTipCardsSets'

export const initialSettings = {
  numberOfCards: 8,
  cardHeadline: 'Hey :)',
  cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
  cardsQrCodeLogo: 'bitcoin',
  setName: '',
}

export type Settings = typeof initialSettings

export type CardsSetRecord = {
  setId: string
  settings: Settings
  date: string
}

type CardsSetRecordEncoded = {
  setId: string
  settings: string
  date: string
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

export const encodeCardsSetSettings = (settingsDecoded: Settings): string => {
  return btoa(encodeURIComponent(JSON.stringify({
    ...getDefaultSettings(),
    ...settingsDecoded,
  })))
}

export const useCardsSets = () => {
  const savedCardsSets = ref<CardsSetRecord[]>([])

  const loadSavedCardsSets = () => {
    let fromLocalStorage: CardsSetRecordEncoded[] = []
    try {
      fromLocalStorage = JSON.parse(localStorage.getItem(SAVED_CARD_SETS_KEY) || '[]')
    } catch (error) {
      // do nothing
    }
    savedCardsSets.value = fromLocalStorage.map((set) => ({
      ...set,
      settings: decodeCardsSetSettings(set.settings),
    }))
  }

  const saveCardsSet = ({ setId, settings, date }: CardsSetRecord) => {
    if (setId == null) {
      return
    }
    loadSavedCardsSets()
    const existingIndex = savedCardsSets.value.findIndex(({ setId: existingSetId }) => existingSetId === setId)
    const newSets: CardsSetRecordEncoded[] = savedCardsSets.value.map((set) => ({
      ...set,
      settings: encodeCardsSetSettings(set.settings),
    }))
    if (existingIndex > -1) {
      newSets[existingIndex] = { setId, settings: encodeCardsSetSettings(settings), date }
    } else {
      newSets.push({ setId, settings: encodeCardsSetSettings(settings), date })
    }
    localStorage.setItem(SAVED_CARD_SETS_KEY, JSON.stringify(newSets))
    loadSavedCardsSets()
  }

  const deleteCardsSet = (setId: string) => {
    if (setId === null) {
      return
    }
    loadSavedCardsSets()
    localStorage.setItem(SAVED_CARD_SETS_KEY, JSON.stringify([
      ...savedCardsSets.value
        .filter((set) => set.setId !== setId)
        .map((set) => ({
          ...set,
          settings: encodeCardsSetSettings(set.settings),
        })),
    ]))
    loadSavedCardsSets()
  }

  return {
    savedCardsSets,
    loadSavedCardsSets,
    saveCardsSet,
    deleteCardsSet,
  }
}
