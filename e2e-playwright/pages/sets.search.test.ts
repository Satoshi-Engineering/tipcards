import { expect, test, type Page } from '@playwright/test'

import { login } from '../utils/auth/login'
import { generateAndAddSet } from '../utils/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const setsListItems = '[data-test="sets-list-item"]'
const setsCount = '[data-test="sets-list-sets-count"]'

test.describe('Sets Page', () => {
  test.beforeEach(async ({ context }) => {
    await login(context)
  })

  test('displays the correct set after searching by part of the name when exchanging lower case chars and upper case chars', async ({ context, page }) => {
    const set1 = await generateAndAddSet(context, 'Name of the Set 1')
    const set2 = await generateAndAddSet(context, 'Random Set Name Containing 123 !@#$%^&*() Äöüß')
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('NaME conTAINIng 123 !@#$%^&')

    const setItems = page.locator(setsListItems)
    await expect(setItems).toHaveCount(1)
    await expect(setItems).not.toContainText(set1.settings.setName)
    await expect(setItems).toContainText(set2.settings.setName)
  })

  test('displays the correct sets after searching by number of cards', async ({ context, page }) => {
    const set1 = await generateAndAddSet(context, { numberOfCards: 10 })
    const set2 = await generateAndAddSet(context, { numberOfCards: 89 })
    const set3 = await generateAndAddSet(context, { numberOfCards: 89 })
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('89 cards')

    const setItems = page.locator(setsListItems)
    await expect(setItems).toHaveCount(2)
    const setsList = page.locator('[data-test="sets-list"]')
    await expect(setsList).toContainText(set2.settings.setName)
    await expect(setsList).toContainText(set3.settings.setName)
    await expect(setsList).not.toContainText(set1.settings.setName)
  })

  test('displays the correct set after searching by date', async ({ context, page }) => {
    const set1 = await generateAndAddSet(context, {
      created: +new Date('2020-12-01') / 1000,
      changed: +new Date('2021-01-01') / 1000,
    })
    await generateAndAddSet(context)
    await generateAndAddSet(context)
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('01/01/2021')

    const setItems = page.locator(setsListItems)
    await expect(setItems).toHaveCount(1)
    await expect(setItems).toContainText(set1.settings.setName)
  })

  test('displays the correct number of sets for a collection containing multiple sets', async ({ context, page }) => {
    await generateAndAddSet(context)
    await generateAndAddSet(context)
    await generateAndAddSet(context)
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse

    await expect(page.locator(setsCount)).toContainText('3 / 3 sets')
  })

  test('displays the correct number of sets after filtering for a string that matches some sets from a collection containing multiple sets', async ({ context, page }) => {
    await generateAndAddSet(context, 'Similar Set 1')
    await generateAndAddSet(context, 'Similar Set 2')
    await generateAndAddSet(context, 'Different Set 3')
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('similar')

    await expect(page.locator(setsCount)).toContainText('2 / 3 sets')
  })

  test('displays the plural of the sets count translation when 0 sets remain filtered from a collection of multiple sets', async ({ context, page }) => {
    await generateAndAddSet(context, 'existent1')
    await generateAndAddSet(context, 'existent2')
    await generateAndAddSet(context, 'existent3')
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('non-existent')

    await expect(page.locator(setsCount)).toContainText('0 / 3 sets')
  })

  test('displays the plural of the sets count translation when 1 set remains filtered from a collection of multiple sets', async ({ context, page }) => {
    await generateAndAddSet(context, 'existent1')
    await generateAndAddSet(context, 'existent2')
    await generateAndAddSet(context, 'existent3')
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('existent1')

    await expect(page.locator(setsCount)).toContainText('1 / 3 sets')
  })

  test('displays the singular of the sets count translation for a collection containing one set', async ({ context, page }) => {
    await generateAndAddSet(context, 'Random Set Name')
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse

    await expect(page.locator(setsCount)).toContainText('1 / 1 set')
  })

  test('displays the singular of the sets count translation when 0 sets remain filtered from a collection containing one set', async ({ context, page }) => {
    await generateAndAddSet(context)
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="input-search"]').fill('non-existent')

    await expect(page.locator(setsCount)).toContainText('0 / 1 set')
  })

  test.describe('with two sets', () => {
    test('displays the plural of the sets count translation when 0 sets remain filtered from a collection of multiple sets', async ({ context, page }) => {
      await generateAndAddSet(context, 'existent1')
      await generateAndAddSet(context, 'existent2')
      const setsResponse = waitForSetsResponse(page)
      await page.goto('/sets')
      await setsResponse
      await page.locator('[data-test="input-search"]').fill('non-existent')

      await expect(page.locator(setsCount)).toContainText('0 / 2 sets')
    })
  })
})

const waitForSetsResponse = (page: Page) => page.waitForResponse(response => response.url().includes('set.getAll'))
