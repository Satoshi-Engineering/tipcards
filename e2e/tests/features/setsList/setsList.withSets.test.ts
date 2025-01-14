import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Sets List with sets data', () => {
  it('should login and display the user\'s sets aferwards', () => {
    // preparation: create a user and a set w/o logging in
    tipCardsApi.auth.createUserWithoutLogin()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId({
      numberOfSets: 5,
      numberOfCardsPerSet: 8,
    })
    tipCards.dashboard.goto()

    // log in via ui
    cy.get('[data-test=sets-list-message-not-logged-in] button').click()
    tipCards.auth.loginViaModalLogin()

    // the sets should get loaded
    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 3)
  })

  it('loads a single set on the dashboard page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.dashboard.goto()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 1)
  })

  it('loads a single set on the sets page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.generateAndAddSet()

    tipCards.sets.goto()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 1)
  })
})
