import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

const TRPC_PROFILE_GET = new URL('/trpc/profile.get', BACKEND_API_ORIGIN)

describe('Feature logoutAllOtherDevices', () => {
  // MIGRATED TO PLAYWRIGHT: e2e-playwright/trpc/profile.test.ts
  it.skip('should not be able to refresh, if the user is logged out', () => {
    cy.request({
      url: TRPC_PROFILE_GET.href,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })
})
