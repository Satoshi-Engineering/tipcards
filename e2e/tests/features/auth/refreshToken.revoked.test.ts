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

  it('should show modal login with generic error message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.task<string>('jwt:generateInvalidRefreshToken', {
        refreshToken: cookie.value,
      }).then((refreshToken) => {
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

  it('should show modal login, if user logged out on another device and wants to use the log out all other devices feature', () => {
    tipCardsApi.auth.login()
    tipCards.gotoUserAccount()
    tipCardsApi.auth.logoutAllDevices()

    cy.getTestElement('user-account-button-logout-all-other-devices').click()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })

  it('should show modal login with generic error message, if user clicked log out all other devices but has no valid refresh token', () => {
    tipCardsApi.auth.login()
    tipCards.gotoUserAccount()
    cy.getCookie('refresh_token').then((cookie) => {
      cy.task<string>('jwt:generateInvalidRefreshToken', {
        refreshToken: cookie.value,
      }).then((refreshToken) => {
        cy.setCookie('refresh_token', refreshToken)
      })
    })

    cy.getTestElement('user-account-button-logout-all-other-devices').click()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You were logged out')
  })
})
