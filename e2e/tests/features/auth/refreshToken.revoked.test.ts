import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Revoked/denied refresh doken', () => {
  it('should show modal login with session expiration message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.task<string>('logoutAllDevices', cookie.value).then((userId) => {
        cy.log(userId)
      })
    })

    tipCards.gotoHomePage()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })
})
