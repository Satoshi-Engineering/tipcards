import tipCardsApi from '@e2e/lib/tipCardsApi'
import tipCards from '@e2e/lib/tipCards'

describe('Dashboard Cards Summary', () => {
  it('should show the preview if the user is logged out', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('cards-summary-preview').should('exist')
  })

  it('should open the modal login', () => {
    tipCards.gotoDashboardPage()

    cy.getTestElement('dashboard-login-link').click()

    cy.getTestElement('modal-login').should('exist')
  })

  it('should show zeros if the user has no sets', () => {
    tipCardsApi.auth.login()

    tipCards.gotoDashboardPage()

    cy.getTestElement('cards-summary').should('exist')
    cy.getTestElement('cards-summary-withdrawn').should('contain.text', '0 sats')
    cy.getTestElement('cards-summary-funded').should('contain.text', '0 sats')
    cy.getTestElement('cards-summary-total').should('contain.text', '0 sats')
  })

  it('should show correct numbers if the user has sets', () => {
    tipCardsApi.auth.login()
    cy.get('@userId').then((userId) => {
      cy.task('db:create100TestSets', { userId })
    })

    cy.intercept('/trpc/**card.cardsSummary**').as('cardsSummary')
    tipCards.gotoDashboardPage()
    cy.wait('@cardsSummary')

    cy.getTestElement('cards-summary').should('exist')
    cy.getTestElement('cards-summary-withdrawn').should('contain.text', '7350 sats')
    cy.getTestElement('cards-summary-funded').should('contain.text', '19950 sats')
    cy.getTestElement('cards-summary-total').should('contain.text', '27300 sats')
  })
})
