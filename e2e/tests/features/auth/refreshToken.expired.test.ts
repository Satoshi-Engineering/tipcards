import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Expired refresh token', () => {
  it('should show modal login with session expiration message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token', {
      domain: TIPCARDS_AUTH_ORIGIN.hostname,
    }).then((cookie) => {
      cy.task<string>('jwt:generateExpiredRefreshToken', {
        refreshToken: cookie.value,
      }).then((refreshToken) => {
        cy.setCookie('refresh_token', refreshToken, {
          domain: TIPCARDS_AUTH_ORIGIN.hostname,
          secure: true,
          sameSite: 'no_restriction',
          httpOnly: true,
        })
      })
    })

    tipCards.home.goto()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'Your login expired')
  })
})
