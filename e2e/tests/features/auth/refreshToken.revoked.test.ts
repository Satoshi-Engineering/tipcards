import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Revoked/denied refresh doken', () => {
  it('should show modal login with logged out by other device error message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.task<string>('logoutAllDevices', cookie.value)
    })

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
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })
})
