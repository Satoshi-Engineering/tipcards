import { expect, type BrowserContext, type Page } from '@playwright/test'

import { loginViaUi } from '@e2e/utils/auth/login'
import { lnbitsTestUserWalletApiContext } from '@e2e/utils/lnbits/api/apiContext'

type GenerateSetOptions = {
  changed?: number
  created?: number
  name?: string
  numberOfCards?: number
  userId?: string
}

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
  await loginViaUi({ page, lnbitsApiContext: lnbitsTestUserWalletApiContext })

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

export const generateAndAddSet = async (
  browserContext: BrowserContext,
  options?: string | GenerateSetOptions,
) => {
  const accessTokenResponse = await browserContext.request.get(
    `${process.env.TIPCARDS_AUTH_ORIGIN}/auth/trpc/auth.refreshRefreshToken`,
  )
  expect(accessTokenResponse.ok()).toBe(true)
  const accessTokenBody = await accessTokenResponse.json()
  const accessToken = accessTokenBody.result.data.json.accessToken as string
  const set = generateSet(typeof options === 'string' ? { name: options } : options)
  const addSetResponse = await browserContext.request.post(
    `${process.env.BACKEND_API_ORIGIN}/api/set/${set.id}/`,
    {
      data: set,
      headers: { Authorization: accessToken },
    },
  )
  expect(addSetResponse.ok()).toBe(true)
  return set
}

const generateSet = ({
  changed = Math.floor(Date.now() / 1000),
  created = Math.floor(Date.now() / 1000),
  name,
  numberOfCards = 8,
  userId,
}: GenerateSetOptions = {}) => {
  const id = crypto.randomUUID()
  return {
    id,
    settings: {
      numberOfCards,
      cardHeadline: `${id} cardHeadline`,
      cardCopytext: `${id} cardCopytext`,
      cardsQrCodeLogo: 'bitcoin',
      setName: name || `${id} setName`,
      landingPage: 'default',
    },
    created,
    date: changed,
    userId,
    text: '',
    note: '',
    invoice: null,
  }
}
