import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const SETS_PAGE_URL = new URL('/sets', TIPCARDS_ORIGIN)

const gotoSetsPage = () => {
  cy.intercept('/api/auth/refresh').as('refreshRoute')
  cy.intercept('/api/set').as('setsRoute')
  cy.visit(SETS_PAGE_URL.href)
  cy.wait('@refreshRoute')
  cy.wait('@setsRoute')
}

describe('Sets Page', () => {
  beforeEach(() => {
    cy.login()
  })

  it.skip('User should see the empty sets list', () => {
    gotoSetsPage()
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
    cy.getTestElement('sets-list-empty').should('exist')
  })

  it('User should access a saved set', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    cy.addSet()
    cy.addSet(randomSetName)
    gotoSetsPage()
    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('please-login-section').should('not.exist')
    cy.getTestElement('logged-in').should('exist')
    cy.getTestElement('sets-list-empty').should('not.exist')
    cy.getTestElement('sets-list-with-data').find('a').contains(randomSetName).click()
    cy.url().should('contain', '/cards')
    cy.getTestElement('the-layout').contains(randomSetName).should('be.visible')
  })
})
