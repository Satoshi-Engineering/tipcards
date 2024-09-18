import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Feature Logout', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('User should should get logged out', () => {
    tipCards.gotoHomePage()

    cy.intercept('/auth/trpc/auth.logout**').as('logout')
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').should('exist')

    // Check if the page stayed on the same page
    cy.url().then((initialUrl) => {
      cy.getTestElement('main-nav-link-logout').click()
      cy.wait('@logout')
      cy.url().should('eq', initialUrl)
    })

    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').should('not.exist')
    tipCardsApi.auth.isLoggedOut()

    // Check if the user is logged out, after go to home page
    tipCards.gotoHomePage()
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').should('not.exist')
    tipCardsApi.auth.isLoggedOut()
  })

  it.skip('Data vanishes after logout', () => {
    // Sets
  })
})
