import tipCards from '@e2e/lib/tipCards'

describe('Feature logoutAllOtherDevices', () => {
  before(() => {
    cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser').then(({ userId }) => {
      cy.task<string>('db:insertAllowedSession', {
        userId,
      }).then((sessionId) => {
        cy.task<string>('jwt:createRefreshToken', {
          userId,
          sessionId,
        }).then((refreshToken) => {
          cy.wrap(refreshToken).as('refreshToken1')
        })
      })

      cy.task<string>('db:insertAllowedSession', {
        userId,
      }).then((sessionId) => {
        cy.task<string>('jwt:createRefreshToken', {
          userId,
          sessionId,
        }).then((refreshToken) => {
          cy.wrap(refreshToken).as('refreshToken2')
        })
      })

      cy.task<string>('db:insertAllowedSession', {
        userId,
      }).then((sessionId) => {
        cy.task<string>('jwt:createRefreshToken', {
          userId,
          sessionId,
        }).then((refreshToken) => {
          cy.wrap(refreshToken).as('refreshToken3')
        })
      })
    })
  })

  it('2nd user session should still be logged in', () => {
    // Refresh Token 1: Check if it's still valid
    cy.get('@refreshToken1').then(function () {
      cy.session(this.refreshToken1, () => {
        cy.setCookie('refresh_token', this.refreshToken1)
      })
    })
    tipCards.gotoHomePage()
    reloadPageAndCheckAuth()
    cy.clearAllCookies()

    // Refresh Token 2: Logout on all other devices
    cy.get('@refreshToken2').then(function () {
      cy.session(this.refreshToken2, () => {
        cy.setCookie('refresh_token', this.refreshToken2)
      })
    })
    tipCards.gotoHomePage()
    reloadPageAndCheckAuth()
    tipCards.gotoUserAccount()

    cy.intercept('/auth/trpc/auth.logoutAllOtherDevices**').as('logoutAllOtherDevices')
    cy.getTestElement('user-account-button-logout-all-other-devices').click()
    cy.wait('@logoutAllOtherDevices')
    reloadPageAndCheckAuth()
    cy.clearAllCookies()

    // Refresh Token 3: Check if it's logged out
    cy.get('@refreshToken3').then(function () {
      cy.session(this.refreshToken3, () => {
        cy.setCookie('refresh_token', this.refreshToken3)
      })
    })
    tipCards.gotoHomePage()
    tipCards.reloadPage()
    tipCards.isLoggedOut()
  })
})

const reloadPageAndCheckAuth = () => {
  tipCards.reloadPage()
  tipCards.isLoggedIn()
}
