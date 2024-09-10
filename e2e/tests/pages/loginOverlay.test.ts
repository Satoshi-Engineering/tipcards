import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Login Overlay', () => {
  beforeEach(() => {
    tipCardsApi.auth.clearAuth()

    cy.fixture('keys.json').then((keys) => {
      const lnurlAuth = new LNURLAuth({
        publicKeyAsHex: keys.publicKeyAsHex,
        privateKeyAsHex: keys.privateKeyAsHex,
      })
      cy.wrap(lnurlAuth).as('lnurlAuth')
    })

    tipCards.gotoLoginPage()
  })

  it('check if user is logged out', () => {
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('logged-in').should('not.exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('Close ModalLogin with close button', () => {
    openModalLogin()
    cy.getTestElement('modal-login-close-button').click()
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('Login with click on qr code', () => {
    openModalLogin()

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

    login()
    checkLoginSuccess()
  })

  it('Login with lnurl from clipboard', () => {
    openModalLogin()
    cy.addListener('copy', (event) => {
      cy.log(event)
    })

    cy.getTestElement('lnurlauth-qrcode-copy-2-clipboard').click()
    cy.task<string>('getClipboard').then((clipboardText) => {
      cy.wrap(clipboardText).as('lnurlAuthUrl')
    })

    login()
    checkLoginSuccess()
  })
})

const openModalLogin = () => {
  cy.intercept('/auth/trpc/lnurlAuth.create**').as('trpcLnurlAuthCreate')
  cy.intercept('/auth/trpc/auth.loginWithLnurlAuthHash**').as('trpcLoginWithLnurlAuthHash')

  cy.getTestElement('the-layout').should('exist')
  cy.getTestElement('logged-in').should('not.exist')
  cy.getTestElement('the-header-main-nav-button').click()

  cy.getTestElement('main-nav-link-login').click()
  cy.getTestElement('modal-login').should('exist')
  cy.wait('@trpcLnurlAuthCreate')
}

const login = () => {
  cy.get('@lnurlAuth').get('@lnurlAuthUrl').then(function () {
    const LNURLAuthCallbackUrl = this.lnurlAuth.getLNURLAuthCallbackUrl(this.lnurlAuthUrl)
    cy.request({
      url: LNURLAuthCallbackUrl.href,
    }).its('status').should('eq', 200)
  })
  cy.wait('@trpcLoginWithLnurlAuthHash')
}

const checkLoginSuccess = () => {
  cy.getTestElement('lightning-qr-code-image-success').should('exist')
  cy.getTestElement('modal-login-close-button').click()
  cy.getTestElement('modal-login').should('not.exist')

  tipCardsApi.auth.refresh()
  tipCardsApi.auth.isLoggedIn()
}
