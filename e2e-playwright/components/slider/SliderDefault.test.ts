import { expect, test, type Locator } from '@playwright/test'

test.use({ viewport: { width: 1000, height: 660 } })

const pointerX = 1000

const pointerDownEvent = {
  button: 0,
  buttons: 1,
  pointerId: 1,
  clientX: pointerX,
  clientY: 1000,
  screenX: pointerX,
  screenY: 1000,
  pageX: pointerX,
  pageY: 1000,
}

const pointerMoveLeft = (deltaX: number) => ({
  pointerId: 1,
  clientX: pointerX - deltaX,
  clientY: 1000,
  screenX: pointerX - deltaX,
  screenY: 1000,
  pageX: pointerX - deltaX,
  pageY: 1000,
})

test.describe('SliderDefault', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/style-guide/components')
  })

  test('renders the slider', async ({ page }) => {
    const slider = page.locator('[data-test="slider-default"]').first()
    const slides = slider.locator('[data-test="slide-default"]')
    await expect(slides).toHaveCount(3)

    const slide1 = slides.nth(0)
    const slide2 = slides.nth(1)
    const slide3 = slides.nth(2)

    await expectSlideToBeVisibleInSlider(slide1, slider)
    await expect(slide1).toContainText('Slide 1')
    await expectSlideNotToBeVisibleInSlider(slide2, slider)
    await expectSlideNotToBeVisibleInSlider(slide3, slider)
  })

  test.skip('swipes to the second slide', async ({ page }) => {
    const slider = page.locator('[data-test="slider-default"]').first()
    const slides = slider.locator('[data-test="slide-default"]')
    await expect(slides).toHaveCount(3)

    const slide1 = slides.nth(0)
    const slide2 = slides.nth(1)
    const slide3 = slides.nth(2)

    const sliderWidth = await slider.evaluate(element => element.getBoundingClientRect().width)
    const sliderList = slider.locator('ul')
    await sliderList.dispatchEvent('pointerdown', pointerDownEvent)
    await sliderList.dispatchEvent('pointermove', pointerMoveLeft(Math.round(sliderWidth * 0.3)))
    await sliderList.dispatchEvent('pointermove', pointerMoveLeft(Math.round(sliderWidth * 0.6)))
    await sliderList.dispatchEvent('pointerup', { pointerId: 1 })

    await expectSlideToBeVisibleInSlider(slide2, slider)
    await expectSlideNotToBeVisibleInSlider(slide1, slider)
    await expectSlideNotToBeVisibleInSlider(slide3, slider)
  })

  test('navigates to third slide using pagination', async ({ page }) => {
    const slider = page.locator('[data-test="slider-default"]').first()
    const slides = slider.locator('[data-test="slide-default"]')
    await expect(slides).toHaveCount(3)

    const slide1 = slides.nth(0)
    const slide2 = slides.nth(1)
    const slide3 = slides.nth(2)

    await slider.locator('[data-test="slider-default-pagination"] button').nth(2).click()

    await expectSlideToBeVisibleInSlider(slide3, slider)
    await expectSlideNotToBeVisibleInSlider(slide1, slider)
    await expectSlideNotToBeVisibleInSlider(slide2, slider)
  })
})

const expectSlideToBeVisibleInSlider = async (slide: Locator, slider: Locator) => {
  await expect.poll(() => visibleSlideRatio(slide, slider)).toBeGreaterThan(0.9)
}

const expectSlideNotToBeVisibleInSlider = async (slide: Locator, slider: Locator) => {
  await expect.poll(() => visibleSlideRatio(slide, slider)).toBeLessThan(0.1)
}

const visibleSlideRatio = async (slide: Locator, slider: Locator) => {
  const [slideBox, sliderBox] = await Promise.all([
    slide.boundingBox(),
    slider.boundingBox(),
  ])

  if (!slideBox || !sliderBox) {
    throw new Error('Slider and slide need bounding boxes.')
  }

  expect(slideBox.width).toBeGreaterThan(0)

  const visibleWidth = Math.max(
    0,
    Math.min(slideBox.x + slideBox.width, sliderBox.x + sliderBox.width) - Math.max(slideBox.x, sliderBox.x),
  )

  return visibleWidth / slideBox.width
}
