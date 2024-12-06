import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Dashboard Sets List', () => {
  it('loads 100 sets and displays the 3 most recently changed (descending)', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task('db:create100TestSets', { userId })
    })

    tipCards.gotoDashboardPage()

    cy.get('[data-test=sets-list] [data-test=sets-list-item]').should('have.length', 3)
    cy.get('[data-test=sets-list] [data-test=sets-list-item-date]').then(($els) => {
      const dates = $els.toArray().map((el) => el.textContent)
      expect(new Date(dates[0])).to.be.greaterThan(new Date(dates[1]))
      expect(new Date(dates[1])).to.be.greaterThan(new Date(dates[2]))
    })
  })
})
