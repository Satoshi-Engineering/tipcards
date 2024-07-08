// https://on.cypress.io/api

describe('Web client', () => {
  it('visits the app root url and checks the headline', () => {
    cy.visit('/')
    cy.contains('h1', 'Lightning Tip Cards')
  })
})
