import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

// generic setsList tests are found at e2e/tests/features/setsList/*
// this group only containts dashboard page specific sets list behaviour
describe('Dashboard Sets List', () => {
  it('loads 100 sets and displays the 3 most recently changed (descending)', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task('db:create100TestSets', { userId })
    })

    tipCards.dashboard.goto()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 3)
    cy.get('[data-test=sets-list] [data-test=sets-list-item-date]').then(($els) => {
      const dates = $els.toArray().map((el) => el.textContent)
      cy.wrap(new Date(dates[0])).should('not.be.lessThan', new Date(dates[1]))
      cy.wrap(new Date(dates[1])).should('not.be.lessThan', new Date(dates[2]))
    })
  })

  it('only shows 3 sets on the dashboard, even if it loaded all on the sets page before', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task('db:create100TestSets', { userId })
    })
    tipCards.sets.goto()

    tipCards.dashboard.goto()

    cy.getTestElement('sets-list-item').should('have.length', 3)
  })
})
