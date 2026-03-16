import { expect, type Page } from '@playwright/test'

import { loginViaUi } from '@e2e-playwright/utils/auth/login'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'

export const gotoCardsPage = async ({ page, setId }: { page: Page; setId: string }) => {
  await page.goto(`${process.env.TIPCARDS_ORIGIN}/cards/${setId}`)
  await expect(page.locator('button[data-test="save-cards-set"]')).toBeVisible()
}

export const gotoSetPage = async ({ page, setId }: { page: Page; setId: string }) => {
  // Open the set route first because it loads the saved set and redirects to /cards with resolved settings in the URL.
  await page.goto(`${process.env.TIPCARDS_ORIGIN}/set/${setId}`)
  await expect(page.locator('button[data-test="save-cards-set"]')).toBeVisible()
}

export const createSavedSet = async ({
  page,
  setId,
  setName,
  numberOfCards,
  cardHeadline,
  cardCopytext,
}: {
  page: Page
  setId: string
  setName: string
  numberOfCards: number
  cardHeadline: string
  cardCopytext: string
}) => {
  await gotoCardsPage({ page, setId })
  await loginViaUi({ page, lnbitsApiContext: lnbitsUserWalletApiContext })

  await page.locator('[data-test="number-of-cards"]').fill(`${numberOfCards}`)
  await page.locator('[data-test="number-of-cards"]').blur()

  await page.getByLabel('Card headline').fill(cardHeadline)
  await page.getByLabel('Card headline').blur()

  await page.getByLabel('Card text').fill(cardCopytext)
  await page.getByLabel('Card text').blur()

  await page.locator('input[type="radio"][value="lightning"]').check()
  await page.getByLabel('Set name').fill(setName)
  await page.locator('button[data-test="save-cards-set"]').click()
  await expect(page.locator('[data-test="svg-set-saved"]')).toBeVisible()
}
