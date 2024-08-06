import { TIPCARDS_ORIGIN } from '../../lib/constants'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

describe('Sets Page', () => {
  it('should show a logged out sets page', () => {
    cy.visit(SETS_PAGE_URL.href)
    cy.getTestElement('headline').should('exist')
    cy.location('pathname').should('equal', '/sets')
    cy.login()
    cy.url().should('contain', 'sets')
    //cy.get('[data-test=please-login-section]').should('not.exist')
    //cy.get('[data-test=logged-in]').should('exist')
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
