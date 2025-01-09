import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets List without sets data', () => {
  it('shows a message on the dashboard page, when the user is logged out', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('shows a message on the sets page, when the user is logged out', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('should open the modal login on the dashboard page', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('sets-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  it('should open the modal login on the sets page', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  it('shows no-content content on the dashboard page', () => {
    tipCardsApi.auth.login()

    tipCards.gotoDashboardPage()

    cy.getTestElement('sets-list-message-empty').should('exist')
  })

  it('shows no-content content on the sets page', () => {
    tipCardsApi.auth.login()

    tipCards.gotoSetsPage()

    cy.getTestElement('sets-list-message-empty').should('exist')
  })
})
