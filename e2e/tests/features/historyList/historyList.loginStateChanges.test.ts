import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('History list handling login state changes', () => {
  it.skip('should login and display the user\'s history afterwards, on the dashboard', () => {
    tipCardsApi.auth.createUserWithoutLogin()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId()
    tipCards.dashboard.goto()

    // log in via ui
    cy.get('[data-test=history-list-message-not-logged-in] button').click()
    cy.getTestElement('lightning-qr-code-image').then(($el) => {
      const lnurlAuthUrl = $el.attr('href').substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    cy.getTestElement('modal-login-close-button').click()

    // the history should get loaded
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 3)
    cy.getTestElement('history-list-message-not-logged-in').should('not.exist')
  })

  it.skip('should login and display the user\'s history afterwards, on the history page', () => {
    tipCardsApi.auth.createUserWithoutLogin()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId()
    tipCards.history.goto()

    // log in via ui
    cy.get('[data-test=history-list-message-not-logged-in] button').click()
    cy.getTestElement('lightning-qr-code-image').then(($el) => {
      const lnurlAuthUrl = $el.attr('href').substring(10)
      cy.wrap(lnurlAuthUrl).as('lnurlAuthUrl')
    })
    tipCardsApi.auth.lnurlAuthLoginWithWrappedKeyPair()
    cy.getTestElement('modal-login-close-button').click()

    // the history should get loaded
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 8)
    cy.getTestElement('history-list-message-not-logged-in').should('not.exist')
  })

  it('should clear the data on logout, on the dashboard', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId()
    tipCards.dashboard.goto()

    // logout via ui
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 3) // make sure everything is loaded before logout
    tipCards.utils.logoutViaMainNav()

    // the history should get loaded
    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 0)
  })

  it('should clear the data on logout, on the history page', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId()
    tipCards.history.goto()

    // logout via ui
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 8) // make sure everything is loaded before logout
    tipCards.utils.logoutViaMainNav()

    // the history should get loaded
    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 0)
  })

  it('should clear the data on logout, on the dashboard, even if the data loading takes longer', () => {
    tipCardsApi.auth.login()
    tipCardsApi.set.createSetsWithSetFundingForCurrentUserId()
    tipCardsApi.utils.delayNextTrpcResponse()
    tipCards.dashboard.goto()

    // logout via ui
    tipCards.utils.logoutViaMainNav()

    // the history should get loaded
    cy.getTestElement('history-list-message-not-logged-in').should('exist')
    cy.get('[data-test=card-status-list] [data-test=items-list-loading-icon--large]').should('not.exist')
    cy.get('[data-test=card-status-list] [data-test=card-status-list-item]').should('have.length', 0)
  })
})
