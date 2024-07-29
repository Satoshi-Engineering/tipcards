const tipCards = new URL(Cypress.env('TIPCARDS_ORIGIN'))

describe('SliderDefault', () => {
  it('renders the slider and swipes to the second slide', () => {
    cy.visit(new URL('/style-guide', tipCards).href)

    // renders the slider
    cy.get('[data-test="slide-default"]').first().should('be.visible')
    cy.get('[data-test="slide-default"]').first().should('contain', 'Slide 1')
    cy.get('[data-test="slide-default"]').eq(1).should('not.be.visible')
    cy.get('[data-test="slide-default"]').eq(2).should('not.be.visible')

    // swipes to the second slide
    cy.get('[data-test="slider-default"]').first()
      .trigger('pointerover')
      .trigger('pointerdown', {
        pointerId: 1,
        clientX: 1000,
        clientY: 1000,
        screenX: 1000,
        screenY: 1000,
        pageX: 1000,
        pageY: 1000,
      })
      .trigger('pointermove', {
        clientX: 900,
        clientY: 1000,
        screenX: 900,
        screenY: 1000,
        pageX: 900,
        pageY: 1000,
      })
      .trigger('pointermove', {
        clientX: 800,
        clientY: 1000,
        screenX: 800,
        screenY: 1000,
        pageX: 800,
        pageY: 1000,
      })
      .trigger('pointerup', { pointerId: 1 })
    cy.get('[data-test="slide-default"]').first().should('not.be.visible')
    cy.get('[data-test="slide-default"]').eq(1).should('be.visible')
    cy.get('[data-test="slide-default"]').eq(2).should('not.be.visible')

    // navigates to third slide using pagination
    cy.get('[data-test="slider-default-pagination"] button').eq(2).click()
    cy.get('[data-test="slide-default"]').first().should('not.be.visible')
    cy.get('[data-test="slide-default"]').eq(1).should('not.be.visible')
    cy.get('[data-test="slide-default"]').eq(2).should('be.visible')
  })
})
