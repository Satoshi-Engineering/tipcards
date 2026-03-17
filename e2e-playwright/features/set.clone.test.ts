import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import { loginViaUi } from '@e2e-playwright/utils/auth/login'
import { fundCard, getCardStatus } from '@e2e-playwright/utils/card'
import { createSavedSet, gotoCardsPage, gotoSetPage } from '@e2e-playwright/utils/set'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'

test.describe('Tipcard Set Cloning', () => {
  const setId = crypto.randomUUID()
  const setName = `E2E Clone Source ${setId}`
  const clonedSetName = `Copy of ${setName}`
  const numberOfCards = 3
  const cardHeadline = 'E2E Clone Headline'
  const cardCopytext = 'E2E clone copytext'

  test('disables the clone button if the user is not logged in', async ({ page, browser }) => {
    // setup
    const unauthenticatedSetId = crypto.randomUUID()
    const unauthenticatedSetName = `E2E Clone Source ${unauthenticatedSetId}`
    await createSavedSet({
      page,
      setId: unauthenticatedSetId,
      setName: unauthenticatedSetName,
      numberOfCards,
      cardHeadline,
      cardCopytext,
    })

    const loggedOutContext = await browser.newContext()
    const loggedOutPage = await loggedOutContext.newPage()

    // action
    await gotoSetPage({ page: loggedOutPage, setId: unauthenticatedSetId })

    // test
    await expect(loggedOutPage.locator('button[data-test="clone-cards-set"]')).toBeDisabled()
    await loggedOutContext.close()
  })

  test('clones a saved set with copied settings and unfunded cards', async ({ page, request }) => {
    // setup
    await createSavedSet({ page, setId, setName, numberOfCards, cardHeadline, cardCopytext })
    await fundCard(await hashSha256(`${setId}/0`), lnbitsUserWalletApiContext)

    // action
    await gotoSetPage({ page, setId })
    page.once('dialog', dialog => void dialog.accept())
    await page.locator('button[data-test="clone-cards-set"]').click()

    // test
    await assertChangedSetId({ page, setId })
    await assertCopiedSettings({
      page,
      numberOfCards,
      cardHeadline,
      cardCopytext,
      clonedSetName,
    })
    await assertAllCardsAreUnfunded({ page, numberOfCards })
    await assertSetSavedOnBackend({
      page,
      request,
      numberOfCards,
      cardHeadline,
      cardCopytext,
      clonedSetName,
    })
  })

  test('disables the clone button for a new unsaved set even if the user is logged in', async ({ page }) => {
    // setup
    await loginViaUi({ page, lnbitsApiContext: lnbitsUserWalletApiContext })
    const unsavedSetId = crypto.randomUUID()

    // action
    await gotoCardsPage({ page, setId: unsavedSetId })

    // test
    await expect(page.locator('button[data-test="clone-cards-set"]')).toBeDisabled()
  })
})

async function assertChangedSetId({ page, setId }: { page: Page; setId: string }) {
  await expect(page).not.toHaveURL(new RegExp(`/cards/${setId}(?:$|[/?#])`))
}

async function assertCopiedSettings({
  page,
  numberOfCards,
  cardHeadline,
  cardCopytext,
  clonedSetName,
}: {
  page: Page
  numberOfCards: number
  cardHeadline: string
  cardCopytext: string
  clonedSetName: string
}) {
  await expect(page.locator('[data-test="number-of-cards"]')).toHaveValue(`${numberOfCards}`)
  await expect(page.getByLabel('Card headline')).toHaveValue(cardHeadline)
  await expect(page.getByLabel('Card text')).toHaveValue(cardCopytext)
  await expect(page.locator('input[type="radio"][value="lightning"]')).toBeChecked()
  await expect(page.getByLabel('Set name')).toHaveValue(clonedSetName)
}

async function assertAllCardsAreUnfunded({ page, numberOfCards }: { page: Page; numberOfCards: number }) {
  const clonedSetId = page.url().match(/\/cards\/([^/?#]+)/)?.[1]
  expect(clonedSetId).toBeTruthy()

  const cardStatuses = await Promise.all(
    Array.from({ length: numberOfCards }, async (_, index) => await getCardStatus(await hashSha256(`${clonedSetId}/${index}`))),
  )

  expect(cardStatuses).toEqual(Array(numberOfCards).fill('unfunded'))
}

async function assertSetSavedOnBackend({
  page,
  request,
  numberOfCards,
  cardHeadline,
  cardCopytext,
  clonedSetName,
}: {
  page: Page
  request: APIRequestContext
  numberOfCards: number
  cardHeadline: string
  cardCopytext: string
  clonedSetName: string
}) {
  const clonedSetId = page.url().match(/\/cards\/([^/?#]+)/)?.[1]
  expect(clonedSetId).toBeTruthy()

  const response = await request.get(`${process.env.BACKEND_API_ORIGIN}/api/set/${clonedSetId}`)
  expect(response.ok()).toBeTruthy()

  const body = await response.json()
  expect(body.status).toBe('success')
  expect(body.data).toMatchObject({
    id: clonedSetId,
    settings: {
      numberOfCards,
      cardHeadline,
      cardCopytext,
      setName: clonedSetName,
    },
  })
}
