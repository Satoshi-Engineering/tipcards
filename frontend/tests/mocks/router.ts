import { config, RouterLinkStub } from '@vue/test-utils'

config.global.stubs = {
  ...config.global.stubs,
  RouterLink: RouterLinkStub,
}
config.global.mocks = {
  ...config.global.mocks,
  $route: {
    params: {},
  },
}
