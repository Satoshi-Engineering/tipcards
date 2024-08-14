import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

const x = 1000

const pointerDownEvent = {
  button: 0,
  buttons: 1,
  pointerId: 1,
  clientX: x,
  clientY: 1000,
  screenX: x,
  screenY: 1000,
  pageX: x,
  pageY: 1000,
}

const pointerMoveLeft = (deltaX: number) => ({
  pointerId: 1,
  clientX: x - deltaX,
  clientY: 1000,
  screenX: x - deltaX,
  screenY: 1000,
  pageX: x - deltaX,
  pageY: 1000,
})

describe('SliderDefault', () => {
  it('renders the slider and swipes to the second slide', () => {
    cy.visit(new URL('/style-guide/components', TIPCARDS_ORIGIN).href)
    cy.get('[data-test="slider-default"]').first().as('slider')
    cy.get('@slider').find('[data-test="slide-default"]').eq(0).as('slide1')
    cy.get('@slider').find('[data-test="slide-default"]').eq(1).as('slide2')
    cy.get('@slider').find('[data-test="slide-default"]').eq(2).as('slide3')

    // renders the slider
    cy.get('@slide1')
      .should('be.visible')
      .should('contain', 'Slide 1')
    cy.get('@slide2').should('not.be.visible')
    cy.get('@slide3').should('not.be.visible')

    // swipes to the second slide
    cy.get('@slider').then(($slider) => {
      const width = $slider.width()
      cy.log(`Width: ${width}`)
      cy.get('@slider').find('ul')
        .trigger('pointerdown', pointerDownEvent)
        .trigger('pointermove', pointerMoveLeft(Math.round(width * 0.3)))
        .trigger('pointermove', pointerMoveLeft(Math.round(width * 0.6)))
        .trigger('pointerup', { force: true, pointerId: 1 })
    })
    cy.wait(500)
    cy.get('@slide1').should('not.be.visible')
    cy.get('@slide2').should('be.visible')
    cy.get('@slide3').should('not.be.visible')

    // navigates to third slide using pagination
    cy.get('[data-test="slider-default-pagination"] button').eq(2).click()
    cy.wait(500)
    cy.get('@slide1').should('not.be.visible')
    cy.get('@slide2').should('not.be.visible')
    cy.get('@slide3').should('be.visible')
  })
})
