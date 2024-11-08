import tipCards from '@e2e/lib/tipCards'

describe('AllowedRefreshToken and AllowedSession', () => {
  it('check if refresh token changes from format AllowedRefreshToken to AllowedSession', () => {
    cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser').then(({ userId, lnurlAuthKey }) => {
      cy.task<string>('jwt:createRefreshTokenFormatAllowedRefreshTokens', {
        expirationTime: '28d',
        userId,
        lnurlAuthKey,
      }).then((refreshToken) => {
        cy.task<string>('db:insertAllowedRefreshToken', {
          userId,
          refreshToken,
        })
        cy.setCookie('refresh_token', refreshToken)
      })
    })

    tipCards.gotoHomePage()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').should('exist')
    cy.getCookie('refresh_token').then((refreshToken) => {
      cy.task<boolean>('jwt:validateRefreshTokenFormatAllowedSessions', {
        refreshToken: refreshToken.value,
      }).then((validation) => {
        expect(validation).to.eq(true)
      })
    })
  })
})
