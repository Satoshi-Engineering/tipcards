import { describe, it, expect } from 'vitest'

import { encodeCardsSetSettingsFromDto, legacySettingsFromSetSettingsDto, setSettingsDtoFromLegacySettings } from '@/utils/cardsSetSettings'
import type { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto'
import type { Settings } from '@shared/data/api/Set'

describe('encodeCardsSetSettings', () => {
  it('should return the correct base64 string', async () => {
    const settings = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      image: 'bitcoin',
      name: 'a beautiful set',
      landingPage: 'default',
    }
    const encodedSettings = encodeCardsSetSettingsFromDto(settings)
    expect(encodedSettings).toBe('JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyWW91JTIwZ290JTIwYSUyMHRpcC4lMjAlRjAlOUYlOEUlODklNUNuU2NhbiUyMHRoaXMlMjBRUiUyMGNvZGUlMjBhbmQlMjBsZWFybiUyMGhvdyUyMHRvJTIwcmVjZWl2ZSUyMGJpdGNvaW4uJTIyJTJDJTIyY2FyZHNRckNvZGVMb2dvJTIyJTNBJTIyYml0Y29pbiUyMiUyQyUyMnNldE5hbWUlMjIlM0ElMjJhJTIwYmVhdXRpZnVsJTIwc2V0JTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE')
  })
})

describe('legacySettingsFromSetSettingsDto', () => {
  it('should convert a SetSettingsDto correctly to a legacy Settings object', async () => {
    const setSettingsDto: SetSettingsDto = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      image: 'bitcoin',
      name: 'a beautiful set',
      landingPage: 'default',
    }
    const legacySettings: Settings = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      cardsQrCodeLogo: 'bitcoin',
      setName: 'a beautiful set',
      landingPage: 'default',
    }
    const encodedSettings = legacySettingsFromSetSettingsDto(setSettingsDto)
    expect(encodedSettings).toStrictEqual(legacySettings)
  })
})

describe('setSettingsDtoFromLegacySettings', () => {
  it('should convert a legacy Settings object correctly to a SetSettingsDto', async () => {
    const legacySettings: Settings = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      cardsQrCodeLogo: 'bitcoin',
      setName: 'a beautiful set',
      landingPage: 'default',
    }
    const setSettingsDto: SetSettingsDto = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      image: 'bitcoin',
      name: 'a beautiful set',
      landingPage: 'default',
    }
    const encodedSettings = setSettingsDtoFromLegacySettings(legacySettings)
    expect(encodedSettings).toStrictEqual(setSettingsDto)
  })
})
