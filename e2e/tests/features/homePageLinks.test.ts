import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const HOME_PAGE_URL = new URL('/', TIPCARDS_ORIGIN)

describe('homePageLinks', () => {
  it('should navigate to the cards page when the create button is clicked', () => {
    cy.visit(HOME_PAGE_URL.href)
    cy.get('[data-test="hero-section"] [data-test="button-create"]').should('exist').click()
    cy.url().should('contain', 'cards')
  })

  it('should navigate to the sets page when the sets button is clicked', () => {
    cy.visit(HOME_PAGE_URL.href)
    cy.get('[data-test="hero-section"] [data-test="button-sets"]').should('exist').click()
    cy.url().should('contain', '/sets')
  })

  it('should render the two expected sliders', () => {
    cy.visit(HOME_PAGE_URL.href)
    cy.get('[data-test="slider-how-it-works"]').should('exist')
    cy.get('[data-test="slider-video-guides"]').should('exist')
  })

  it('should navigate to the cards page when the button in the first slider is clicked', () => {
    cy.visit(HOME_PAGE_URL.href)
    cy.get('[data-test="slider-how-it-works"] [data-test="slider-button-start"]').first().click()
    cy.url().should('contain', '/cards')
  })

  it('should navigate to youtube when the play button in the second slider is clicked', () => {
    cy.visit(HOME_PAGE_URL.href)

    cy.origin('https://www.youtube.com', () => {
      cy.on('uncaught:exception', (e) => {
        if (e.message.includes('Blocked a frame with origin "https://www.youtube.com" from accessing a cross-origin frame.')) {
          // we expected this error, so let's ignore it
          // and let the test continue
          return false
        }
        if (e.message.includes("Cannot read properties of undefined (reading 'indexOf')")) {
          // we expected this error, so let's ignore it
          // and let the test continue
          return false
        }
      })
    })

    cy.get('[data-test="slider-video-guides"] [data-test="slider-video-link"]').eq(1)
      .should('exist')
      .then(($link) => {
        expect($link).to.have.attr('target', '_blank')
        expect($link).attr('href').to.contain('youtube')
        $link.attr('target', '_self')
      })
      .click()

    cy.origin('https://www.youtube.com', () => {
      cy.title().should('contain', 'Lightning Tip')
    })
  })
})
