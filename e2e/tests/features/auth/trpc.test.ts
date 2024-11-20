import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import tipCardsApi from '@e2e/lib/tipCardsApi'
import tipCards from '@e2e/lib/tipCards'

const API_AUTH_REFRESH = new URL('/auth/trpc/auth.refreshRefreshToken', TIPCARDS_AUTH_ORIGIN)

describe('Feature logoutAllOtherDevices', () => {
  it('should not be able to refresh, if the user is logged out', () => {
    cy.request({
      url: API_AUTH_REFRESH.href,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('Lnurl auth callback url call should fail, after a login has happend', () => {
    tipCardsApi.auth.createAndWrapLNURLAuth()
    tipCards.gotoHomePage()
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-login').click()
    cy.getTestElement('lightning-qr-code-image').invoke('attr', 'href').then(lnurlAuthUrlHref => {
      const lnurlAuthUrl = lnurlAuthUrlHref.substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })

    cy.intercept('/auth/trpc/auth.loginWithLnurlAuthHash**').as('trpcLoginWithLnurlAuthHash')
    cy.get('@lnurlAuth').get('@lnurlAuthUrl').then(function () {
      const LNURLAuthCallbackUrl = this.lnurlAuth.getLNURLAuthCallbackUrl(this.lnurlAuthUrl)
      cy.request({
        url: LNURLAuthCallbackUrl.href,
      }).its('status').should('eq', 200)
    })
    cy.wait('@trpcLoginWithLnurlAuthHash')

    // Try second login
    cy.get('@lnurlAuth').get('@lnurlAuthUrl').then(function () {
      const LNURLAuthCallbackUrl = this.lnurlAuth.getLNURLAuthCallbackUrl(this.lnurlAuthUrl)
      cy.request({
        url: LNURLAuthCallbackUrl.href,
        failOnStatusCode: false,
      }).its('status').should('eq', 400)
    })
  })
})
