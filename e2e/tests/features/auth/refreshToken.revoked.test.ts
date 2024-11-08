import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Revoked/denied refresh doken', () => {
  it('should show modal login with logged out by other device error message', () => {
    tipCardsApi.auth.login()
    tipCardsApi.auth.logoutAllDevices()

    tipCards.gotoHomePage()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })

  // todo : wait for backend fix from fil
  it.skip('should show modal login with generic error message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.task<string>('generateInvalidRefreshToken', cookie.value).then((refreshToken) => {
        cy.setCookie('refresh_token', refreshToken)
      })
    })

    tipCards.gotoHomePage()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You were logged out')
  })

  it('should show modal login, if user logged out on another device while using application', () => {
    tipCardsApi.auth.login()
    tipCards.gotoNewSetPageWithExpiredAccessToken()
    // make sure the access token is expired
    cy.wait(10_000)
    tipCardsApi.auth.logoutAllDevices()

    cy.get('button[data-test="save-cards-set"]').click()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })
})
