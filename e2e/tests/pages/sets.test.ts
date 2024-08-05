import { TIPCARDS_ORIGIN } from '../lib/constants'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

describe('Sets Page', () => {
  it('should show a logged out sets page', () => {
    cy.visit(SETS_PAGE_URL.href)
    cy.getTestElement('headline').should('exist')
    cy.url().should('contain', 'sets')
    cy.get('[data-test=please-login-section]').should('exist')
    cy.get('[data-test=logged-in]').should('not.exist')
  })

  it('should navigate to the cards page when the new set button is clicked', () => {
    cy.visit(SETS_PAGE_URL.href)
    cy.get('[data-test=button-new-set]').should('exist').click()
    cy.url().should('contain', 'cards')
  })

  it.skip('should show a logged out sets page with sets in local storage', () => {
  })

  it.skip('should show an empty sets page', () => {
  })

  it.skip('should show a list of named and nameless sets', () => {
  })

  it.skip('should navigate to a saved set', () => {
    // How do I verify if it's a new set or saved set?
  })
})
