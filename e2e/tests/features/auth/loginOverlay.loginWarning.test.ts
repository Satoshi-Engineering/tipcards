import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Login Overlay - Email CTA', () => {
  beforeEach(() => {
    tipCardsApi.auth.clearAuth()
    tipCardsApi.auth.createAndWrapLNURLAuth()

    tipCards.gotoHomePage()
  })

  it('After login cta should be displayed', () => {
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-login').click()

    wrapLNURLAuthFromLinkClick()
    login()

    cy.getTestElement('emailCta').should('exist')
  })

  it.skip('After login cta should be displayed', () => {
    cy.task('db:createUser', {
      profileEmail: 'email@domain.com',
    })

    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-login').click()

    wrapLNURLAuthFromLinkClick()
    login()

    cy.getTestElement('emailCta').should('not.exist')
  })
})

const wrapLNURLAuthFromLinkClick = () => {
  cy.getTestElement('lightning-qr-code-image')
    .should('have.attr', 'href')
    .and('match', /^lightning:.+/)

  // Stub the link click, because cypress can not handle different protocolls, then http and https
  // Attention: You should not use variables! Please refactor if you have an idea!
  let lnurlAuthUrlHref = ''
  cy.get('a[href^="lightning:"]').then(($link) => {
    $link.on('click', (e) => {
      e.preventDefault()
      lnurlAuthUrlHref = $link.attr('href')
    })
  })

  cy.getTestElement('lightning-qr-code-image').click()

  cy.then(() => {
    const lnurlAuthUrl = lnurlAuthUrlHref.substring(10)
    cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
  })
}

/**
 * Performs login via LNURLAuth
 *
 * This function relies on the Cypress environment variables `lnurlAuth`
 * and `lnurlAuthUrl` to perform the authentication.
 *
 * @returns {void}
 */
const login = () => {
  cy.intercept('/auth/trpc/auth.loginWithLnurlAuthHash**').as('trpcLoginWithLnurlAuthHash')

  cy.get('@lnurlAuth').get('@lnurlAuthUrl').then(function () {
    const LNURLAuthCallbackUrl = this.lnurlAuth.getLNURLAuthCallbackUrl(this.lnurlAuthUrl)
    cy.request({
      url: LNURLAuthCallbackUrl.href,
    }).its('status').should('eq', 200)
  })
  cy.wait('@trpcLoginWithLnurlAuthHash')
}
