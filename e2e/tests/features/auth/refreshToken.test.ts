import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Refresh token', () => {
  it('should do nothing if none exists', () => {
    tipCards.gotoSetsPage()

    cy.getTestElement('modal-login').should('not.exist')
    cy.getTestElement('the-login-banner').should('exist')
  })

  it('should do nothing if logged in', () => {
    tipCardsApi.auth.login()

    tipCards.gotoSetsPage()

    cy.getTestElement('modal-login').should('not.exist')
    cy.getTestElement('the-login-banner').should('not.exist')
  })
})
