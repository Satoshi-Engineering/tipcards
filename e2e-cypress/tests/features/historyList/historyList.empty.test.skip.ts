import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('History list without data', () => {
  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.empty.test.ts
  it.skip('should render logged out state if logged out on the dashboard page, if the user is logged out', () => {
    tipCards.dashboard.goto()

    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.empty.test.ts
  it.skip('should render logged out state if logged out on the history page, if the user is logged out', () => {
    tipCards.history.goto()

    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.empty.test.ts
  it.skip('should open the modal login on the dashboard page', () => {
    tipCards.dashboard.goto()

    cy.getTestElement('history-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.empty.test.ts
  it.skip('should open the modal login on the history page', () => {
    tipCards.history.goto()

    cy.getTestElement('history-list-message-not-logged-in').then(($el) => {
      cy.wrap($el.find('button')).click()
    })

    cy.getTestElement('modal-login').should('exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.empty.test.ts
  it.skip('shows no-content content on the dashboard page', () => {
    tipCardsApi.auth.login()

    tipCards.dashboard.goto()

    cy.get('[data-test=card-status-list] [data-test=items-list-message-no-items]').should('exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/historyList/historyList.empty.test.ts
  it.skip('shows no-content content on the history page', () => {
    tipCardsApi.auth.login()

    tipCards.history.goto()

    cy.get('[data-test=card-status-list] [data-test=items-list-message-no-items]').should('exist')
  })
})
