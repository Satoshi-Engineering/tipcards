import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets List without sets data', () => {
  it('shows a message on the dashboard page, when the user is logged out', () => {
    tipCards.dashboard.goto()

    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('shows a message on the sets page, when the user is logged out', () => {
    tipCards.sets.goto()

    cy.getTestElement('sets-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('should open the modal login on the dashboard page', () => {
    tipCards.dashboard.goto()

    cy.getTestElement('sets-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  it('should open the modal login on the sets page', () => {
    tipCards.sets.goto()

    cy.getTestElement('sets-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  it('shows no-content content on the dashboard page', () => {
    tipCardsApi.auth.login()

    tipCards.dashboard.goto()

    cy.getTestElement('sets-list-message-empty').should('exist')
  })

  it('shows no-content content on the sets page', () => {
    tipCardsApi.auth.login()

    tipCards.sets.goto()

    cy.getTestElement('sets-list-message-empty').should('exist')
  })
})
