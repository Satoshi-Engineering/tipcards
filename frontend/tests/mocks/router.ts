import { config, RouterLinkStub } from '@vue/test-utils'
import { vi } from 'vitest'

export const mockRoute = {
  params: {},
}

export const mockRouter = {
  push: vi.fn(),
}

config.global.stubs = {
  ...config.global.stubs,
  RouterLink: RouterLinkStub,
}
config.global.mocks = {
  ...config.global.mocks,
  $route: mockRoute,
  $router: mockRouter,
}
