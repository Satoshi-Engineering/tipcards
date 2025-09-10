import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const ABOUT_PAGE_URL = new URL('/about', TIPCARDS_ORIGIN)

describe('aboutPageLinks', () => {
  it('should navigate to the cards page when the create button is clicked', () => {
    cy.visit(ABOUT_PAGE_URL.href)
    cy.get('[data-test="hero-section"] [data-test="button-create"]').should('exist').click()
    cy.url().should('contain', 'cards')
  })

  it('should navigate to github when the button in the open source section is clicked', () => {
    cy.visit(ABOUT_PAGE_URL.href)
    cy.get('[data-test="button-open-source"]').first()
      .should('exist')
      .then(($link) => {
        expect($link).to.have.attr('target', '_blank')
        expect($link).attr('href').to.contain('github')
        $link.attr('target', '_self')
      })
      .click()
    cy.origin('https://github.com', () => {
      cy.url().should('contain', 'tipcards')
    })
  })

  it('should render a button href in the license section with a href pointing to the license on github', () => {
    cy.visit(ABOUT_PAGE_URL.href)
    cy.get('[data-test="button-license"]').first()
      .should('exist')
      .then(($link) => {
        expect($link).to.have.attr('target', '_blank')
        expect($link).attr('href').to.contain('github')
        expect($link).attr('href').to.contain('tipcards')
        expect($link).attr('href').to.contain('LICENSE')
      })
  })
})
