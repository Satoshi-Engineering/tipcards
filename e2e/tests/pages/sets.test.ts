import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets Page', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
  })

  it('User should see the empty sets list', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('sets-list-message-not-logged-in').should('not.exist')
    cy.getTestElement('sets-list-message-empty').should('exist')
  })

  it('User should access a saved set', () => {
    const randomSetName = Math.random().toString(36).substring(7)
    tipCardsApi.set.generateAndAddSet()
    tipCardsApi.set.generateAndAddSet(randomSetName)

    tipCards.gotoSetsPage()
    cy.getTestElement('sets-list-item').contains(randomSetName).click()

    cy.url().should('contain', '/cards')
    cy.getTestElement('the-layout').contains(randomSetName).should('be.visible')
  })

  it('User should see logged out message after logging out', () => {
    tipCardsApi.auth.clearAuth()

    tipCards.gotoSetsPage()

    cy.getTestElement('the-layout').should('exist')
    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('sets-list-message-empty').should('not.exist')
  })
})
