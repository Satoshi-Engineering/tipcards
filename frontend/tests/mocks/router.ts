import { config, RouterLinkStub } from '@vue/test-utils'
import { vi } from 'vitest'

type MockRoute = {
  params: Record<string, string>
  meta?: unknown
}

export const mockRoute: MockRoute = {
  params: {},
  meta: undefined,
}

export const mockRouter = {
  push: vi.fn(),
}

vi.mock('vue-router', async (importOriginal) => {
  const actual: object = await importOriginal()
  return {
    ...actual,
    useRoute: vi.fn(() => mockRoute),
    useRouter: vi.fn(() => mockRouter),
  }
})

config.global.stubs = {
  ...config.global.stubs,
  RouterLink: RouterLinkStub,
}
config.global.mocks = {
  ...config.global.mocks,
  $route: mockRoute,
  $router: mockRouter,
}
