import tipCards from '@e2e/lib/tipCards'
import {
  shouldBeVisibleInSlider,
  shouldNotBeVisibleInSlider,
} from './sliderTestUtils'

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
  // MIGRATED TO PLAYWRIGHT: e2e-playwright/components/slider/SliderDefault.test.ts
  it.skip('renders the slider', () => {
    tipCards.styleGuide.gotoComponents()

    cy.get('[data-test="slider-default"]').first().as('slider')
    cy.get('@slider').find('[data-test="slide-default"]').eq(0).as('slide1')
    cy.get('@slider').find('[data-test="slide-default"]').eq(1).as('slide2')
    cy.get('@slider').find('[data-test="slide-default"]').eq(2).as('slide3')

    shouldBeVisibleInSlider('@slide1')
    cy.get('@slide1').should('contain', 'Slide 1')
    shouldNotBeVisibleInSlider('@slide2')
    shouldNotBeVisibleInSlider('@slide3')
  })

  // PRE-EXISTING SKIP; MIGRATED TO PLAYWRIGHT: e2e-playwright/components/slider/SliderDefault.test.ts
  it.skip('swipes to the second slide', () => {
    tipCards.styleGuide.gotoComponents()

    // make sure everything is rendered before assigning aliases
    cy.get('[data-test="slider-default"]:first [data-test="slide-default"]')
      .should('have.length', 3)

    cy.get('[data-test="slider-default"]').first().as('slider')
    cy.get('@slider').find('[data-test="slide-default"]').eq(0).as('slide1')
    cy.get('@slider').find('[data-test="slide-default"]').eq(1).as('slide2')
    cy.get('@slider').find('[data-test="slide-default"]').eq(2).as('slide3')

    // swipe to the second slide
    cy.get('@slider').then(($slider) => {
      const width = $slider.width()

      cy.get('@slider')
        .find('ul')
        .trigger('pointerdown', pointerDownEvent)
        .trigger('pointermove', pointerMoveLeft(Math.round(width * 0.3)))
        .trigger('pointermove', pointerMoveLeft(Math.round(width * 0.6)))
        .trigger('pointerup', { force: true, pointerId: 1 })
    })

    shouldBeVisibleInSlider('@slide2')
    shouldNotBeVisibleInSlider('@slide1')
    shouldNotBeVisibleInSlider('@slide3')
  })

  // MIGRATED TO PLAYWRIGHT: e2e-playwright/components/slider/SliderDefault.test.ts
  it.skip('navigates to third slide using pagination', () => {
    tipCards.styleGuide.gotoComponents()

    cy.get('[data-test="slider-default"]').first().as('slider')
    cy.get('@slider').find('[data-test="slide-default"]').eq(0).as('slide1')
    cy.get('@slider').find('[data-test="slide-default"]').eq(1).as('slide2')
    cy.get('@slider').find('[data-test="slide-default"]').eq(2).as('slide3')

    // navigate to third slide using pagination
    cy.get('@slider')
      .find('[data-test="slider-default-pagination"] button')
      .eq(2)
      .click()

    shouldBeVisibleInSlider('@slide3')
    shouldNotBeVisibleInSlider('@slide1')
    shouldNotBeVisibleInSlider('@slide2')
  })
})
