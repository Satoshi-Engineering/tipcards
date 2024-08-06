import { TIPCARDS_ORIGIN } from '../lib/constants'

describe('Web client', () => {
  it('visits the app root url and checks the headline', () => {
    cy.visit(TIPCARDS_ORIGIN.href)
    cy.contains('h1', 'The easiest way to tip with Bitcoin')
  })
})
