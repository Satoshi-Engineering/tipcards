import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Feature Logout', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('should should log out the user', () => {
    tipCards.home.goto()

    cy.getTestElement('the-layout').should('exist')
    logout()

    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').should('not.exist')
    tipCardsApi.auth.isLoggedOut()

    // Check if the user is logged out, after go to home page
    tipCards.home.goto()
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('the-header-main-nav-button').click()
    cy.getTestElement('main-nav-link-logout').should('not.exist')
    tipCardsApi.auth.isLoggedOut()
  })

  it('should remove user specific data after logout', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    tipCardsApi.set.generateAndAddSet(randomSetName)
    tipCards.sets.goto()

    cy.getTestElement('sets-list-message-not-logged-in').should('not.exist')
    cy.getTestElement('sets-list-item').contains(randomSetName).should('exist')

    logout()
    cy.getTestElement('sets-list').should('exist')
    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('the-layout').contains(randomSetName).should('not.exist')
    cy.getTestElement('sets-list-message-empty').should('not.exist')
  })
})

const logout = () => {
  cy.intercept('/auth/trpc/auth.logout**').as('logout')
  cy.getTestElement('the-header-main-nav-button').click()
  cy.getTestElement('main-nav-link-logout').should('exist')

  // Check if the page stayed on the same page
  cy.url().then((initialUrl) => {
    cy.getTestElement('main-nav-link-logout').click()
    cy.wait('@logout')
    cy.url().should('eq', initialUrl)
  })
}
