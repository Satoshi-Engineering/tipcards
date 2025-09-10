import tipCards from '@e2e/lib/tipCards'

describe('homePageLinks', () => {
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

  it('should contain a link to the youtube video in the second slider\'s play button', () => {
    tipCards.home.goto()

    cy.get('[data-test="slider-video-guides"] [data-test="slider-video-link"]').eq(0)
      .should('exist')
      .then(($link) => {
        expect($link).to.have.attr('target', '_blank')
        expect($link).attr('href').to.contain('https://www.youtube.com')
      })
  })
})
