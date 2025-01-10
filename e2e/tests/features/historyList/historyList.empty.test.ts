import tipCards from '@e2e/lib/tipCards'

describe('History list without data', () => {
  it('should render logged out state if logged out on the dashboard page, if the user is logged out', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })

  it('should render logged out state if logged out on the history page, if the user is logged out', () => {
    tipCards.gotoHistoryPage()

    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.getTestElement('modal-login').should('not.exist')
  })
})
