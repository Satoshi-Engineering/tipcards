const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

describe('TheHeader', () => {
  it('clicks on the lang icon in the header and the lang nav should appear and disappear', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
    cy.get('header [data-test=the-header-lang-button]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('exist')
    cy.get('header nav[data-test=the-lang-nav]').contains('English').should('exist')
    cy.get('header [data-test=the-header-close-button]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
  })

  it('click on a lang nav menu item should close the lang nav', () => {
    cy.visit(new URL('/en/style-guide', tipCards).href)
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
    cy.get('header [data-test=the-header-lang-button]').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('exist')
    cy.get('header nav[data-test=the-lang-nav] a').first().click()
    cy.get('header nav[data-test=the-lang-nav]').should('not.exist')
  })
})
