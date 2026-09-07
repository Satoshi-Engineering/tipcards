export const shouldBeVisibleInSlider = (
  slideAlias: string,
  sliderAlias = '@slider',
) => {
  cy.get(sliderAlias).then(($slider) => {
    cy.get(slideAlias).should(($slide) => {
      const slider = $slider[0].getBoundingClientRect()
      const slide = $slide[0].getBoundingClientRect()

      expect(slide.width).to.be.greaterThan(0)

      const visibleWidth = Math.max(
        0,
        Math.min(slide.right, slider.right) - Math.max(slide.left, slider.left),
      )

      expect(visibleWidth / slide.width).to.be.greaterThan(0.9)
    })
  })
}

export const shouldNotBeVisibleInSlider = (
  slideAlias: string,
  sliderAlias = '@slider',
) => {
  cy.get(sliderAlias).then(($slider) => {
    cy.get(slideAlias).should(($slide) => {
      const slider = $slider[0].getBoundingClientRect()
      const slide = $slide[0].getBoundingClientRect()

      expect(slide.width).to.be.greaterThan(0)

      const visibleWidth = Math.max(
        0,
        Math.min(slide.right, slider.right) - Math.max(slide.left, slider.left),
      )

      expect(visibleWidth / slide.width).to.be.lessThan(0.1)
    })
  })
}
