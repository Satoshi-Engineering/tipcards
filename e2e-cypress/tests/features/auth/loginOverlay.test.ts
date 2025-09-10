import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Login Overlay', () => {
  beforeEach(() => {
    tipCardsApi.auth.clearAuth()
    tipCardsApi.auth.createNewKeysAndWrap()
    tipCards.home.goto()
  })

  it('check if user is logged out', () => {
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('logged-in').should('not.exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('Close ModalLogin with close button', () => {
    tipCards.auth.openModalLoginFromMainNav()
    cy.getTestElement('modal-login-close-button').click()
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('Login with click on qr code', () => {
    tipCards.auth.openModalLoginFromMainNav()
    wrapLNURLAuthFromLinkClick()
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    tipCards.auth.closeModalLoginAfterSuccessfulLogin()
    reloadPageAndCheckAuth()
  })

  it('Login with lnurl from clipboard', () => {
    tipCards.auth.openModalLoginFromMainNav()

    cy.getTestElement('lnurlauth-qrcode-copy-2-clipboard').click()
    cy.task<string>('getClipboard').then((clipboardText) => {
      cy.wrap(clipboardText).as('lnurlAuthUrl')
    })

    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    tipCards.auth.closeModalLoginAfterSuccessfulLogin()
    reloadPageAndCheckAuth()
  })

  it('Should login, after a login and logout has happend without reloading or revisiting the page', () => {
    // Login
    tipCards.auth.loginViaMainNav()

    // Logout
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').click()

    // Second Login
    tipCards.auth.loginViaMainNav()
    reloadPageAndCheckAuth()
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
    $link.on('click', (event) => {
      event.preventDefault()
      lnurlAuthUrlHref = $link.attr('href')
    })
  })

  cy.getTestElement('lightning-qr-code-image').click()

  cy.then(() => {
    const lnurlAuthUrl = lnurlAuthUrlHref.substring(10)
    cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
  })
}

const reloadPageAndCheckAuth = () => {
  tipCards.utils.reloadPage()
  tipCards.utils.isLoggedIn()
}
