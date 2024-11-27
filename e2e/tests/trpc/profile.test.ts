import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

const TRPC_PROFILE_GET = new URL('/trpc/profile.get', BACKEND_API_ORIGIN)

describe('Feature logoutAllOtherDevices', () => {
  it('should not be able to refresh, if the user is logged out', () => {
    cy.log(TRPC_PROFILE_GET.href)

    cy.request({
      url: TRPC_PROFILE_GET.href,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })
})
