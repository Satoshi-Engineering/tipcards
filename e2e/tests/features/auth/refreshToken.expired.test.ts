import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Expired refresh token', () => {
  it('should show modal login with session expiration message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.task<string>('jwt:generateExpiredRefreshToken', {
        refreshToken: cookie.value,
      }).then((refreshToken) => {
        cy.setCookie('refresh_token', refreshToken)
      })
    })

    tipCards.gotoHomePage()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'Your login expired')
  })
})
