import type { Settings } from '@shared/data/api/Set'
import type { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto'

export const legacySettingsFromSetSettingsDto = (setSettings: SetSettingsDto): Settings => ({
  numberOfCards: setSettings.numberOfCards,
  cardHeadline: setSettings.cardHeadline,
  cardCopytext: setSettings.cardCopytext,
  cardsQrCodeLogo: setSettings.image,
  setName: setSettings.name,
  landingPage: setSettings.landingPage,
})

export const setSettingsDtoFromLegacySettings = (settings: Settings): SetSettingsDto => ({
  numberOfCards: settings.numberOfCards,
  cardHeadline: settings.cardHeadline,
  cardCopytext: settings.cardCopytext,
  image: settings.cardsQrCodeLogo,
  name: settings.setName,
  landingPage: settings.landingPage,
})

export const encodeCardsSetSettingsFromDto = (setSettings: SetSettingsDto) => {
  const setSettingsConverted = legacySettingsFromSetSettingsDto(setSettings)
  return btoa(encodeURIComponent(JSON.stringify(setSettingsConverted)))
}
