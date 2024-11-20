import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'

const API_AUTH_REFRESH = new URL('/auth/trpc/auth.refreshRefreshToken', TIPCARDS_AUTH_ORIGIN)

describe('Feature logoutAllOtherDevices', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  it('should not be able to refresh, if no login has happened', () => {
    cy.request({
      url: API_AUTH_REFRESH.href,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })
})
