import { expect, test, type Locator } from '@playwright/test'

test.use({ viewport: { width: 1000, height: 660 } })

test.describe('SliderDefault', { tag: '@parallel-safe' }, () => {
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

  test('swipes to the second slide', async ({ page }) => {
    const slider = page.locator('[data-test="slider-default"]').first()
    const slides = slider.locator('[data-test="slide-default"]')
    await expect(slides).toHaveCount(3)

    const slide1 = slides.nth(0)
    const slide2 = slides.nth(1)
    const slide3 = slides.nth(2)

    const sliderList = slider.locator('ul')
    const sliderListBox = await sliderList.boundingBox()
    if (sliderListBox == null) {
      throw new Error('Slider list needs a bounding box.')
    }

    const pointerStartX = sliderListBox.x + sliderListBox.width * 0.8
    const pointerY = sliderListBox.y + sliderListBox.height / 2
    await page.mouse.move(pointerStartX, pointerY)
    await page.mouse.down()
    await page.mouse.move(pointerStartX - sliderListBox.width * 0.6, pointerY, { steps: 2 })
    await page.mouse.up()

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
