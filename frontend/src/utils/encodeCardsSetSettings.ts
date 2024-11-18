import type { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto'

export default (setSettings: SetSettingsDto) => {
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
