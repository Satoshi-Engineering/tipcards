const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

describe('TheHeader', () => {
  it('clicks on the lang nav icon in the header and the lang nav should appear and disappear', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.get('header nav').should('not.exist')
    cy.get('header button').first().click()
    cy.get('header nav').should('exist')
    cy.get('header nav').contains('English').should('exist')
    cy.get('header button').first().click()
    cy.get('header nav').should('not.exist')
  })
})
