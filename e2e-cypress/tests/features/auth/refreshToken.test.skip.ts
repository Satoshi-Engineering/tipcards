import tipCards from '@e2e/lib/tipCards'
import tipCardsApi from '@e2e/lib/tipCardsApi'

describe('Refresh token', () => {
  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/auth/refreshToken.test.ts
  it.skip('should do nothing if none exists', () => {
    tipCards.sets.goto()

    cy.getTestElement('modal-login').should('not.exist')
    cy.getTestElement('the-login-banner').should('exist')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/features/auth/refreshToken.test.ts
  it.skip('should do nothing if logged in', () => {
    tipCardsApi.auth.login()

    tipCards.sets.goto()

    cy.getTestElement('modal-login').should('not.exist')
    cy.getTestElement('the-login-banner').should('not.exist')
  })
})
