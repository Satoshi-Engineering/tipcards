import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Login Overlay - Email CTA', () => {
  beforeEach(() => {
    tipCardsApi.auth.clearAuth()
    tipCardsApi.auth.createNewKeysAndWrap()
    tipCards.gotoHomePage()
  })

  it('After login email cta should be displayed', () => {
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-login').click()
    wrapLNURLAuthFromLinkClick()
    cy.intercept('/trpc/profile.getDisplayName**').as('profileGetDisplayName')
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    cy.wait('@profileGetDisplayName')

    cy.getTestElement('emailCta').should('exist')
  })

  it('After login email cta should not be displayed', () => {
    const profileEmail = 'email@domain.com'
    cy.get('@keyPair').then(function () {
      cy.task<{ userId: string, lnurlAuthKey: string }>('db:createUser', {
        profileEmail,
        lnurlAuthKey: this.keyPair.publicKeyAsHex,
      })
    })

    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-login').click()
    wrapLNURLAuthFromLinkClick()
    cy.intercept('/trpc/profile.getDisplayName**').as('profileGetDisplayName')
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    cy.wait('@profileGetDisplayName')

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
