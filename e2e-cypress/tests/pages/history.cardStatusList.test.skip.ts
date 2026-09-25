import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Card status list loading (sorted) data', () => {
  beforeEach(() => {
    tipCardsApi.auth.login()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId({
      numberOfSets: 5,
      numberOfCardsPerSet: 21,
    })
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/pages/history.cardStatusList.test.ts
  it.skip('should load and display 50 card statuses (sorted) on the history page', () => {
    tipCards.history.goto()

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 50)
    cy.getTestElement('history-load-more-button').should('exist')
    cardStatusListItemsAreSorted()
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/pages/history.cardStatusList.test.ts
  it.skip('should load and display 100 card statuses (sorted) on the history page', () => {
    tipCards.history.goto()
    cy.getTestElement('history-load-more-button').click()

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 100)
    cardStatusListItemsAreSorted()
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/pages/history.cardStatusList.test.ts
  it.skip('should load and display all card statuses (sorted) on the history page', () => {
    tipCards.history.goto()
    cy.getTestElement('history-load-more-button').click()
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 100)
    cy.getTestElement('history-load-more-button').click()

    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 105)
    cy.getTestElement('history-load-more-button').should('not.exist')
    cardStatusListItemsAreSorted()
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/pages/history.cardStatusList.test.ts
  it.skip('should display the large loading icon, when the list has not yet loaded any items', () => {
    tipCards.history.goto()
    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--large]').should('be.visible')
  })

  // PRE-EXISTING SKIP; MIGRATED TO PLAYWRIGHT: e2e-playwright/pages/history.cardStatusList.test.ts
  it.skip('should display the small loading icon, when the list already has items', () => {
    tipCards.history.goto()
    cy.getTestElement('history-load-more-button').click()

    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--small]').should('be.visible')
  })

  // PRE-EXISTING SKIP; MIGRATED TO PLAYWRIGHT: e2e-playwright/pages/history.cardStatusList.test.ts
  it.skip('should display the small loading icon, when the list already has items and load more buttons is clicked twice', () => {
    tipCards.history.goto()
    cy.getTestElement('history-load-more-button').click()
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 100)
    cy.getTestElement('history-load-more-button').click()

    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--small]').should('be.visible')
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
