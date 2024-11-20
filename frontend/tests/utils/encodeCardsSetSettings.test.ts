import { describe, it, expect } from 'vitest'

import encodeCardsSetSettings from '@/utils/encodeCardsSetSettings'

describe('useSets', () => {
  it('encodeCardsSetSettings should return the correct base64 string', async () => {
    const settings = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      image: 'bitcoin',
      name: 'a beautiful set',
      landingPage: 'default',
    }
    const encodedSettings = encodeCardsSetSettings(settings)
    expect(encodedSettings).toBe('JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyWW91JTIwZ290JTIwYSUyMHRpcC4lMjAlRjAlOUYlOEUlODklNUNuU2NhbiUyMHRoaXMlMjBRUiUyMGNvZGUlMjBhbmQlMjBsZWFybiUyMGhvdyUyMHRvJTIwcmVjZWl2ZSUyMGJpdGNvaW4uJTIyJTJDJTIyY2FyZHNRckNvZGVMb2dvJTIyJTNBJTIyYml0Y29pbiUyMiUyQyUyMnNldE5hbWUlMjIlM0ElMjJhJTIwYmVhdXRpZnVsJTIwc2V0JTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE')
  })
})
