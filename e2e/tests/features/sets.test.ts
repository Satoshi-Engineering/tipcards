import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

describe('Sets Page', () => {
  it.skip('should show a logged out sets page', () => {
    cy.login()
    cy.visit(SETS_PAGE_URL.href)
    cy.location('pathname').should('equal', '/sets')
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
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
