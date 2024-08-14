import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

describe('Sets Page', () => {
  beforeEach(() => {
    cy.login()
    cy.intercept('/api/auth/refresh').as('refreshRoute')
    cy.intercept('/api/set').as('setsRoute')
    cy.visit(SETS_PAGE_URL.href)
    cy.wait('@refreshRoute')
    cy.wait('@setsRoute')
  })

  it('Should see the empty sets list of the logged in user', () => {
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
    cy.getTestElement('sets-list-empty').should('exist')
  })

  it.skip('should navigate to the cards page when the new set button is clicked', () => {
  })

  it.skip('should show an empty sets page', () => {
  })

  it.skip('should show a list of named and nameless sets', () => {
  })

  it.skip('should navigate to a saved set', () => {
    // How do I verify if it's a new set or saved set?
  })
})
