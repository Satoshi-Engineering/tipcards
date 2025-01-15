import tipCards from '@e2e/lib/tipCards'

describe('homePageLinks', () => {
  beforeEach(() => {
    // we don't care about errors on youtube
    cy.origin('https://www.youtube.com', () => {
      cy.on('uncaught:exception', () => false) // this makes sure the test won't fail
    })
  })

  it('should navigate to the cards page when the create button is clicked', () => {
    tipCards.home.goto()

    cy.get('[data-test="hero-section"] [data-test="button-create"]').should('exist').click()

    cy.url().should('contain', 'cards')
  })

  it('should navigate to the dashboard page when the dashboard button is clicked', () => {
    tipCards.home.goto()

    cy.get('[data-test="hero-section"] [data-test="button-dashboard"]').should('exist').click()

    cy.url().should('contain', '/dashboard')
  })

  it('should render the two expected sliders', () => {
    tipCards.home.goto()

    cy.get('[data-test="slider-how-it-works"]').should('exist')
    cy.get('[data-test="slider-video-guides"]').should('exist')
  })

  it('should navigate to the cards page when the button in the first slider is clicked', () => {
    tipCards.home.goto()

    cy.get('[data-test="slider-how-it-works"] [data-test="slider-button-start"]').first().click()

    cy.url().should('contain', '/cards')
  })

  it('should navigate to youtube when the play button in the second slider is clicked', () => {
    tipCards.home.goto()

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
