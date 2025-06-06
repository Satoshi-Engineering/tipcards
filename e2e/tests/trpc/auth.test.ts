import { TIPCARDS_AUTH_ORIGIN } from '@e2e/lib/constants'
import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

const API_AUTH_REFRESH = new URL('/auth/trpc/auth.refreshRefreshToken', TIPCARDS_AUTH_ORIGIN)

describe('Trpc Auth', () => {
  it('should not be able to refresh, if the user is logged out', () => {
    cy.request({
      url: API_AUTH_REFRESH.href,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('Lnurl auth callback url call should fail, after a login has happend', () => {
    tipCardsApi.auth.createNewKeysAndWrap()
    tipCards.home.goto()
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-login').click()
    cy.getTestElement('lightning-qr-code-button-open-in-wallet').should('have.attr', 'href')
    cy.getTestElement('lightning-qr-code-button-open-in-wallet').invoke('attr', 'href').then(lnurlAuthUrlHref => {
      const lnurlAuthUrl = lnurlAuthUrlHref.substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })

    cy.intercept('/auth/trpc/auth.loginWithLnurlAuthHash**').as('trpcLoginWithLnurlAuthHash')
    cy.get('@keyPair').get('@lnurlAuthUrl').then(function () {
      cy.task<{ callbackUrl: string }>('lnurl:getLNURLAuthCallbackUrl', {
        publicKeyAsHex: this.keyPair.publicKeyAsHex,
        privateKeyAsHex: this.keyPair.privateKeyAsHex,
        lnurlAuth: this.lnurlAuthUrl,
      }).then(({ callbackUrl }) => {
        cy.wrap(callbackUrl).as('callbackUrl')
        cy.request({
          url: callbackUrl,
        }).its('status').should('eq', 200)
      })
    })
    cy.wait('@trpcLoginWithLnurlAuthHash')

    // Try second login
    cy.get<string>('@callbackUrl').then((callbackUrl) => {
      cy.request({
        url: callbackUrl,
        failOnStatusCode: false,
      }).its('status').should('eq', 400)
    })
  })
})
