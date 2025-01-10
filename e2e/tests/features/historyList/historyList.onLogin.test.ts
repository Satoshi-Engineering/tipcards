import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('History list without data', () => {
  it('should login and display the user\'s history aferwards', () => {
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

  it('should login and display the user\'s history aferwards', () => {
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
})
