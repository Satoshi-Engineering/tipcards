import { ref } from 'vue'

export const SAVED_CARD_SETS_KEY = 'savedTipCardsSets'

export type CardsSetRecord = {
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
export const initialSettingsBase64 = btoa(encodeURIComponent(JSON.stringify(initialSettings)))
export type Settings = typeof initialSettings

export const savedCardsSets = ref<CardsSetRecord[]>([])
export const loadSavedCardsSets = () => {
  try {
    savedCardsSets.value = JSON.parse(localStorage.getItem(SAVED_CARD_SETS_KEY) || '[]')
  } catch (error) {
    savedCardsSets.value = []
  }
}
export const saveCardsSet = ({ setId, settings, date }: CardsSetRecord) => {
  if (setId == null) {
    return
  }
  loadSavedCardsSets()
  localStorage.setItem(SAVED_CARD_SETS_KEY, JSON.stringify([
    ...savedCardsSets.value.filter((set) => set.setId !== setId),
    {
      setId,
      settings,
      date,
    },
  ]))
  loadSavedCardsSets()
}
export const deleteCardsSet = (setId: string) => {
  if (setId === null) {
    return
  }
  loadSavedCardsSets()
  localStorage.setItem(SAVED_CARD_SETS_KEY, JSON.stringify([
    ...savedCardsSets.value.filter((set) => set.setId !== setId),
  ]))
  loadSavedCardsSets()
}

export const decodeCardsSetSettings = (settingsEncoded: string): Settings => {
  try {
    return JSON.parse(decodeURIComponent(atob(settingsEncoded)))
  } catch (error) {
    // do nothing
  }
  return { ...initialSettings }
}
