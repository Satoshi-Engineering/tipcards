import { FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE } from '@e2e/lib/constants'

describe('External landing page', () => {
  it('check if the funded card is loaded', () => {
    cy.visit(FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE)
    cy.contains('You can collect your Lightning tip worth 0.00000210 Bitcoin here.')
  })
})
