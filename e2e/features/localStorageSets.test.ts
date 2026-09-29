import { expect, test } from '@playwright/test'

import { urlWithOptionalTrailingSlash } from '../utils/urlHelpers'

test.use({ viewport: { width: 1000, height: 660 } })

const savedSet = {
  setId: '54b13b5f-8d0f-4003-bd15-e3002ec5c932',
  settings: 'JTdCJTIybnVtYmVyT2ZDYXJkcyUyMiUzQTglMkMlMjJjYXJkSGVhZGxpbmUlMjIlM0ElMjJIZXklMjAlM0EpJTIyJTJDJTIyY2FyZENvcHl0ZXh0JTIyJTNBJTIyVHJpbmtnZWxkJTIwZiVDMyVCQ3IlMjBkaWNoLiUyMCVGMCU5RiU4RSU4OSU1Q25TY2FubmUlMjBkZW4lMjBRUi1Db2RlJTIwdW5kJTIwZXJmYWhyZSUyQyUyMHdpZSUyMGR1JTIwenUlMjBkZWluZW4lMjBCaXRjb2luJTIwa29tbXN0LiUyMiUyQyUyMmNhcmRzUXJDb2RlTG9nbyUyMiUzQSUyMmJpdGNvaW4lMjIlMkMlMjJzZXROYW1lJTIyJTNBJTIyJTIyJTJDJTIybGFuZGluZ1BhZ2UlMjIlM0ElMjJkZWZhdWx0JTIyJTdE',
  created: '2024-07-30T12:15:48.000Z',
  date: '2024-07-30T12:15:48.000Z',
}

const secondSavedSet = {
  ...savedSet,
  setId: 'bb02fdd5-c556-425e-9464-32d07a8ad327',
}

test.describe('localStorageSets', { tag: '@parallel-safe' }, () => {
  test('should render no warning, if no localStorage sets exist', async ({ page }) => {
    await page.goto('/sets')

    await expect(page.locator('[data-test="sets-in-local-storage-warning"]')).toHaveCount(0)
  })

  test('should render a warning with link, if localStorage sets exist', async ({ page }) => {
    await page.addInitScript(savedSets => {
      window.localStorage.setItem('savedTipCardsSets', JSON.stringify(savedSets))
    }, [savedSet])
    await page.goto('/sets')

    const warning = page.locator('[data-test="sets-in-local-storage-warning"]')
    await expect(warning).toBeAttached()
    await warning.locator('a').click()
    await expect(page).toHaveURL(urlWithOptionalTrailingSlash('/local-storage-sets'))
  })

  test('should navigate to a set page', async ({ page }) => {
    await page.addInitScript(savedSets => {
      window.localStorage.setItem('savedTipCardsSets', JSON.stringify(savedSets))
    }, [savedSet, secondSavedSet])
    await page.goto('/local-storage-sets')

    const setLinks = page.locator('[data-test="local-storage-sets-list"] a')
    await expect(setLinks).toHaveCount(2)
    await setLinks.first().click()
    await expect(page).toHaveURL(/cards\/54b13b5f-8d0f-4003-bd15-e3002ec5c932/)
  })

  test('should delete all sets', async ({ page }) => {
    await page.addInitScript(savedSets => {
      window.localStorage.setItem('savedTipCardsSets', JSON.stringify(savedSets))
    }, [savedSet, secondSavedSet])
    await page.goto('/local-storage-sets')

    const setLinks = page.locator('[data-test="local-storage-sets-list"] a')
    await expect(setLinks).toHaveCount(2)
    page.once('dialog', dialog => void dialog.accept())
    await page.locator('[data-test="local-storage-sets-clear-all"]').first().click()
    await expect(setLinks).toHaveCount(0)
  })
})
