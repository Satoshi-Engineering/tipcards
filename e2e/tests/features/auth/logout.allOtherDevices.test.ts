import tipCards from '@e2e/lib/tipCards'

const numberOfRefreshTokens = 4

describe('Feature logoutAllOtherDevices', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  it('all refresh tokens should be valid', () => {
    createUserAndWrapRefreshTokens({ numberOfRefreshTokens })

    for (let i = 0; i < numberOfRefreshTokens; i++) {
      checkIfRefreshTokenIsValid(i)
    }
  })

  it('only the second refresh tokens should be valid', () => {
    const activeRefreshTokenIndex = 1
    createUserAndWrapRefreshTokens({ numberOfRefreshTokens })

    setRefreshToken(activeRefreshTokenIndex)
    tipCards.gotoUserAccount()
    cy.intercept('/auth/trpc/auth.logoutAllOtherDevices**').as('logoutAllOtherDevices')
    cy.getTestElement('user-account-button-logout-all-other-devices').click()
    cy.wait('@logoutAllOtherDevices')

    for (let i = 0; i < numberOfRefreshTokens; i++) {
      cy.log('Step', i)
      if (i === activeRefreshTokenIndex) {
        checkIfRefreshTokenIsValid(i)
      } else {
        checkIfRefreshTokenIsInValid(i)
      }
    }
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
        httpOnly: true,
        secure: true,
        sameSite: 'no_restriction',
      })
    })
  })
}

const checkIfRefreshTokenIsValid = (refreshTokenIndex: number) => {
  setRefreshToken(refreshTokenIndex)
  tipCards.gotoHomePage()
  tipCards.isLoggedIn()
}

const checkIfRefreshTokenIsInValid = (refreshTokenIndex: number) => {
  setRefreshToken(refreshTokenIndex)
  tipCards.gotoHomePage()
  tipCards.isLoggedOut()
}
