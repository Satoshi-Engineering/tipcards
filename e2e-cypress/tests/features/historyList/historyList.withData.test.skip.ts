import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('History list loading (sorted) data', () => {
  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.withData.test.ts
  it.skip('should load and display 3 card statuses (sorted) on the dashboard page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.create100TestSetsForCurrentUserId()

    tipCards.dashboard.goto()

    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--large]').should('be.visible')
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 3)
    cardStatusListItemsAreSorted()
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.withData.test.ts
  it.skip('should load and display 50 card statuses (sorted) on the history page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.create100TestSetsForCurrentUserId()

    tipCards.history.goto()

    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--large]').should('be.visible')
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 50)
    cardStatusListItemsAreSorted()
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.withData.test.ts
  it.skip('should display 3 card statuses and load additional data when navigating from dashboard to history page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.create100TestSetsForCurrentUserId()
    tipCards.dashboard.goto()

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 3)
    tipCardsApi.utils.delayNextTrpcResponse()
    cy.get('a[data-test=link-to-full-history]').click()

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 3)
    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--small]').should('be.visible')

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 50)
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.withData.test.ts
  it.skip('should display 3 card statuses when navigating from history page to dashboard', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.create100TestSetsForCurrentUserId()
    tipCards.history.goto()

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 50)
    cy.get('a[data-test=back-link-to-dashboard]').click()

    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--large]').should('not.exist')
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 3)
  })
})

const cardStatusListItemsAreSorted = () => {
  cy.getTestElement('card-status-list-item')
    .then(($els) => {
      const dates = $els.toArray().map((el) => {
        const withdrawn = el.querySelector('[data-test=card-status-list-item-date-withdrawn]')?.textContent
        if (withdrawn) {
          return withdrawn
        }
        const bulkWithdrawCreated = el.querySelector('[data-test=card-status-list-item-date-bulkWithdrawCreated]')?.textContent
        if (bulkWithdrawCreated) {
          return bulkWithdrawCreated
        }
        const landingPageViewed = el.querySelector('[data-test=card-status-list-item-date-landingPageViewed]')?.textContent
        if (landingPageViewed) {
          return landingPageViewed
        }
        const funded = el.querySelector('[data-test=card-status-list-item-date-funded]')?.textContent
        if (funded) {
          return funded
        }
        const created = el.querySelector('[data-test=card-status-list-item-date-created]')?.textContent
        if (created) {
          return created
        }

        throw new Error('Card status list item is missing its date.')
      })
      for (let i = 0; i < dates.length - 1; i++) {
        cy.wrap(new Date(dates[i])).should('not.be.lessThan', new Date(dates[i + 1]))
      }
    })
}
