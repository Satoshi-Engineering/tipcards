import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Feature logoutAllOtherDevices', () => {
  it('2nd user session should still be logged in', () => {
    cy.log('Get Refresh Token 1')
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.log(cookie.value)
      cy.wrap(cookie.value).as('refreshToken1')
    })
    tipCardsApi.auth.clearAuth()
    tipCardsApi.auth.isLoggedOut()

    cy.log('Get Refresh Token 2')
    tipCardsApi.auth.login(false)
    cy.getCookie('refresh_token').then((cookie) => {
      cy.log(cookie.value)
      cy.wrap(cookie.value).as('refreshToken2')
    })
    tipCardsApi.auth.clearAuth()
    tipCardsApi.auth.isLoggedOut()

    cy.log('Get Refresh Token 3')
    tipCardsApi.auth.login(false)
    cy.getCookie('refresh_token').then((cookie) => {
      cy.log(cookie.value)
      cy.wrap(cookie.value).as('refreshToken3')
    })
    tipCardsApi.auth.clearAuth()
    tipCardsApi.auth.isLoggedOut()
    tipCards.isLoggedOut()

    // Refresh Token 1: Check if it's still valid
    cy.get('@refreshToken1').then(function () {
      cy.session(this.refreshToken1, () => {
        cy.setCookie('refresh_token', this.refreshToken1)
      })
    })
    tipCards.gotoHomePage()
    reloadPageAndCheckAuth()

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
