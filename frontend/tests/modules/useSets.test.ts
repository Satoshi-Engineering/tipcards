import { describe, it, expect } from 'vitest'

import '../mocks/i18n'
import '../mocks/provide'
import '../mocks/pinia'
import '../mocks/router'

// import { useAuthStore } from '@/stores/auth'
import useSets from '@/modules/useSets'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

describe('useSets', () => {
  const testComponent = defineComponent({
    setup: () => ({ ...useSets() }),
    template: '<div></div>',
  })

  // const authStore = vi.mocked(useAuthStore())

  it('encodeCardsSetSettings should return the correct base64 string', async () => {
    const wrapper = mount(testComponent)

    const settings = {
      numberOfCards: 8,
      cardHeadline: 'Hey :)',
      cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
      image: 'bitcoin',
      name: 'a beautiful set',
      landingPage: 'default',
    }
    const encodedSettings = wrapper.vm.encodeCardsSetSettings(settings)
    expect(encodedSettings).toBe('JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyWW91JTIwZ290JTIwYSUyMHRpcC4lMjAlRjAlOUYlOEUlODklNUNuU2NhbiUyMHRoaXMlMjBRUiUyMGNvZGUlMjBhbmQlMjBsZWFybiUyMGhvdyUyMHRvJTIwcmVjZWl2ZSUyMGJpdGNvaW4uJTIyJTJDJTIyY2FyZHNRckNvZGVMb2dvJTIyJTNBJTIyYml0Y29pbiUyMiUyQyUyMnNldE5hbWUlMjIlM0ElMjJhJTIwYmVhdXRpZnVsJTIwc2V0JTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE')
  })
})
