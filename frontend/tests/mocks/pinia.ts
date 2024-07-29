import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'

const testingPinia = createTestingPinia({
  createSpy: vi.fn(),
})

config.global.plugins = [...config.global.plugins, testingPinia]

export default testingPinia
