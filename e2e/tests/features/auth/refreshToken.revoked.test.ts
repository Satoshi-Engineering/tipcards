import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Revoked/denied refresh doken', () => {
  it('should show modal login with logged out by other device error message', () => {
    tipCardsApi.auth.login()
    tipCardsApi.auth.logoutAllDevices()

    tipCards.home.goto()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })

  it('should show nothing if the user is logged out', () => {
    tipCardsApi.auth.login()
    tipCardsApi.auth.logoutAllDevices()
    tipCards.home.goto() // after this the user is logged out and the refresh token cookie should be cleared

    cy.reload()

    tipCards.utils.isLoggedOut()
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('should show modal login with generic error message', () => {
    tipCardsApi.auth.login()
    cy.getCookie('refresh_token', {
      domain: TIPCARDS_AUTH_ORIGIN.hostname,
    }).then((cookie) => {
      cy.task<string>('jwt:generateInvalidRefreshToken', {
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
    cy.getTestElement('modal-login-user-message').should('contain', 'You were logged out')
  })

  it('should show modal login, if user logged out on another device while using application', () => {
    tipCardsApi.auth.login()
    tipCards.cards.gotoNewSetPageWithExpiredAccessToken()
    // make sure the access token is expired
    cy.wait(10_000)
    tipCardsApi.auth.logoutAllDevices()

    cy.get('button[data-test="save-cards-set"]').click()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })

  it('should show modal login, if user logged out on another device and wants to use the log out all other devices feature', () => {
    tipCardsApi.auth.login()
    tipCards.userAccount.goto()
    tipCardsApi.auth.logoutAllDevices()

    cy.getTestElement('user-account-button-logout-all-other-devices').click()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You logged out on another device')
  })

  it('should show modal login with generic error message, if user clicked log out all other devices but has no valid refresh token', () => {
    tipCardsApi.auth.login()
    tipCards.userAccount.goto()
    cy.getCookie('refresh_token', {
      domain: TIPCARDS_AUTH_ORIGIN.hostname,
    }).then((cookie) => {
      cy.task<string>('jwt:generateInvalidRefreshToken', {
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

    cy.getTestElement('user-account-button-logout-all-other-devices').click()

    cy.getTestElement('modal-login').should('exist')
    cy.getTestElement('modal-login-user-message').should('contain', 'You were logged out')
  })
})
