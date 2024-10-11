import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'
import tipCards from '@e2e/lib/tipCards'

describe('TheHeader', () => {
  it('clicks on the lang icon in the header and the lang nav should appear and disappear', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
    cy.get('header [data-test=the-header-lang-button]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('exist')
    cy.get('header nav[data-test=the-lang-nav]').contains('English').should('exist')
    cy.get('header [data-test=the-header-close-button]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
  })

  it('click on a lang nav menu item should close the lang nav', () => {
    cy.visit(new URL('/en/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
    cy.get('header [data-test=the-header-lang-button]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('exist')
    cy.get('header nav[data-test=the-lang-nav] a').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
  })

  it('clicks on the main nav icon in the header and the main nav should appear and disappear', () => {
    cy.visit(new URL('/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('header nav[data-test=the-main-nav]').should('not.exist')
    cy.get('header [data-test=the-header-main-nav-button]').first().click()
    cy.get('header nav[data-test=the-main-nav]').should('exist')
    cy.get('header nav[data-test=the-main-nav]').contains('Home').should('exist')
    cy.get('header [data-test=the-header-close-button]').first().click()
    cy.get('header nav[data-test=the-main-nav]').should('not.exist')
  })

  it('click on a main nav menu item should close the main nav', () => {
    cy.visit(new URL('/en/style-guide', TIPCARDS_ORIGIN).href)
    cy.get('header nav[data-test=the-main-nav]').should('not.exist')
    cy.get('header [data-test=the-header-main-nav-button]').first().click()
    cy.get('header nav[data-test=the-main-nav]').should('exist')
    cy.get('header nav[data-test=the-main-nav] a').first().click()
    cy.get('header nav[data-test=the-main-nav]').should('not.exist')
  })

  it('opening the login modal via button in login banner should close the lang nav', () => {
    tipCards.gotoPage(new URL('/sets', TIPCARDS_ORIGIN))

    cy.get('header [data-test=login-banner-login]').should('exist')
    cy.get('header [data-test=the-header-lang-button]').first().click()

    cy.get('header [data-test=login-banner-login]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
  })

  it('opening the login modal via button in login banner should close the main nav', () => {
    tipCards.gotoPage(new URL('/sets', TIPCARDS_ORIGIN))

    cy.get('header [data-test=login-banner-login]').should('exist')
    cy.get('header [data-test=the-header-main-nav-button]').first().click()

    cy.get('header [data-test=login-banner-login]').first().click()
    cy.get('header nav[data-test=the-main-nav]').should('not.exist')
  })
})
