// https://on.cypress.io/api

const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

const urlWithOptionalTrailingSlash = (url: URL) => new RegExp(`${url}(\\/)?$`)

describe('Web client', () => {
  it('visits the app root url and checks the headline', () => {
    cy.visit(tipCards.href)
    cy.contains('h1', 'Lightning TipCards')
  })

  it('navigates to the style-guide page and back to home', () => {
    cy.visit(new URL('/style-guide', tipCards).href)
    cy.contains('h1', 'Lightning TipCards Style Guide')

    // navigate home
    cy.get('header > a:first-child').click()
    cy.url().should('to.match', urlWithOptionalTrailingSlash(tipCards))

    // navigate to english style guide and home from there
    cy.visit(new URL('/en/style-guide', tipCards).href)
    cy.get('header > a:first-child').click()
    cy
      .url()
      .should(
        'to.match',
        urlWithOptionalTrailingSlash(new URL('/en', tipCards)),
      )
  })
})
