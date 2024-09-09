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

  it('Login with qr code', () => {
    openModalLogin()

    cy.getTestElement('lightning-qr-code-image').then((element) => {
      const link = element.attr('href')
      cy.log(element.attr('href'))
      const lnurlAuthUrl = link.substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })

    login()
    checkLoginSuccess()
  })

  it.skip('Login with qr code link click', () => {
    openModalLogin()

    cy.getTestElement('lightning-qr-code-image').click()

    const lnurlAuthUrl = ''
    cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')

    login()
    checkLoginSuccess()
  })


  it.skip('Login with lnurl from clipboard', () => {
    openModalLogin()
    cy.addListener('copy', (event) => {
      cy.log(event)
    })

    cy.getTestElement('lnurlauth-qrcode-copy-2-clipboard').click()
    const lnurlAuthUrl = navigator.clipboard.readText()
    cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    login()
    checkLoginSuccess()
  })
})

const openModalLogin = () => {
  cy.intercept('/auth/trpc/lnurlAuth.create**').as('trpcLnurlAuthCreate')
  cy.intercept('/api/auth/status/**').as('apiAuthStatus')

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
  cy.wait('@apiAuthStatus')
}

const checkLoginSuccess = () => {
  cy.getTestElement('lightning-qr-code-image-success').should('exist')
  cy.getTestElement('modal-login-close-button').click()
  cy.getTestElement('modal-login').should('not.exist')

  tipCardsApi.auth.refresh()
  tipCardsApi.auth.isLoggedIn()
}
