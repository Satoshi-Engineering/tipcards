import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

const numberOfRefreshTokens = 4

describe('Feature logoutAllOtherDevices', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  it('should create multiple valid refresh tokens', () => {
    createUserAndWrapRefreshTokens({ numberOfRefreshTokens })

    for (let i = 0; i < numberOfRefreshTokens; i++) {
      checkIfRefreshTokenIsValid(i)
    }
  })

  it('should invalidate all other refresh tokens on logout-all-other-devices', () => {
    const activeRefreshTokenIndex = 1
    createUserAndWrapRefreshTokens({ numberOfRefreshTokens })

    setRefreshToken(activeRefreshTokenIndex)
    tipCards.userAccount.goto()
    cy.intercept('/auth/trpc/auth.logoutAllOtherDevices**').as('logoutAllOtherDevices')
    cy.getTestElement('user-account-button-logout-all-other-devices').click()
    cy.wait('@logoutAllOtherDevices')

    for (let i = 0; i < numberOfRefreshTokens; i++) {
      if (i === activeRefreshTokenIndex) {
        checkIfRefreshTokenIsValid(i)
      } else {
        checkIfRefreshTokenIsInValid(i)
      }
    }
  })

  // on a 401 the user gets logged out (checkout refreshToken.revoked.test.ts)
  // on other errors (e.g. 500), the user should not get logged out but an error message should be shown
  it('should show an error message if an error on the backend occurs', () => {
    tipCardsApi.auth.login()
    tipCards.userAccount.goto()
    cy.intercept('/auth/trpc/auth.logoutAllOtherDevices**', {
      statusCode: 500,
      body: [
        {
          error: {
            json: {
              message: 'Unknown error',
              code: -32603,
              data: {
                code: 'INTERNAL_SERVER_ERROR',
                httpStatus: 500,
                stack: 'Trpc Stack Trace',
                path: 'auth.logoutAllOtherDevices',
              },
            },
          },
        },
      ],
    }).as('logoutAllOtherDevices')

    cy.getTestElement('user-account-button-logout-all-other-devices').click()

    cy.getTestElement('modal-login').should('not.exist')
    cy.getTestElement('user-error-messages').should('contain', 'Error while logging out all other devices')
  })
})

const createUserAndWrapRefreshTokens = ({ numberOfRefreshTokens }: { numberOfRefreshTokens: number }) => {
  cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser').then(({ userId }) => {
    for (let i = 0; i < numberOfRefreshTokens; i++) {
      cy.task<string>('db:insertAllowedSession', {
        userId,
      }).then((sessionId) => {
        cy.task<string>('jwt:createRefreshToken', {
          userId,
          sessionId,
        }).then((refreshToken) => {
          cy.wrap(refreshToken).as(`refreshToken${i}`)
        })
      })
    }
  })
}

const setRefreshToken = (refreshTokenIndex: number) => {
  cy.get<string>(`@refreshToken${refreshTokenIndex}`).then((refreshToken) => {
    cy.session(refreshToken, () => {
      cy.setCookie('refresh_token', refreshToken, {
        domain: TIPCARDS_AUTH_ORIGIN.hostname,
        secure: true,
        sameSite: 'no_restriction',
        httpOnly: true,
        hostOnly: true,
      })
    })
  })
}

const checkIfRefreshTokenIsValid = (refreshTokenIndex: number) => {
  setRefreshToken(refreshTokenIndex)
  tipCards.home.goto()
  tipCards.utils.isLoggedIn()
}

const checkIfRefreshTokenIsInValid = (refreshTokenIndex: number) => {
  setRefreshToken(refreshTokenIndex)
  tipCards.home.goto()
  tipCards.utils.isLoggedOut()
}
