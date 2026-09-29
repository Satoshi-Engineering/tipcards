import { expect, test, type Page } from '@playwright/test'

import { completeLogin, createLnurlAuthKeyPair, type LnurlAuthKeyPair } from '../utils/auth/lnurlAuth'
import { login } from '../utils/auth/login'
import { createUser } from '../utils/auth/refreshToken'
import {
  create100TestSets,
  createSetsWithSetFunding,
  createSetWithBulkWithdrawTask,
  createSetWithCardFundingTasks,
} from '../utils/database/set'
import { generateCardHashForSet } from '../utils/database/setCardFixtures'
import { generateAndAddSet } from '../utils/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('OpenTasks', () => {
  test('should not render if logged out', { tag: '@parallel-safe' }, async ({ page }) => {
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await expect(page.locator('[data-test="open-tasks"]')).toHaveCount(0)
  })

  test('should not render if the user is logged in and there are no todos', { tag: '@parallel-safe' }, async ({ context, page }) => {
    await login(context)
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await expect(page.locator('[data-test="open-tasks"]')).toHaveCount(0)
  })

  test('should not render, even if a set is created', { tag: '@parallel-safe' }, async ({ context, page }) => {
    await login(context)
    await generateAndAddSet(context)
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await expect(page.locator('[data-test="open-tasks"]')).toHaveCount(0)
  })

  test('should load the open tasks on login', { tag: '@parallel-safe' }, async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    const userId = await createUserForLogin(keyPair)
    await createSetWithBulkWithdrawTask(userId)
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await page.locator('[data-test="login-banner-login"]').click()
    await loginThroughOpenTasksBanner(page, keyPair)

    await expect(page.locator('[data-test="open-tasks"]')).toBeAttached()
  })

  test('should show all todos for the 100 test sets', async ({ context, page }) => {
    test.setTimeout(70_000)
    const userId = await login(context)
    const sets = await create100TestSets(userId)
    const authResponse = waitForAuthResponse(page)
    const openTasksResponse = waitForOpenTasksResponse(page)
    await page.goto('/dashboard')
    await authResponse
    await openTasksResponse

    await expect(page.locator('[data-test="open-tasks"]')).toContainText('9337 cards with open tasks')
    await expect(page.locator('[data-test="open-tasks-list"]')).toBeAttached()
    await expect(page.locator('[data-test="open-tasks-list"] li')).toHaveCount(102)

    const set4 = getSetByName(sets, 'Set 004')
    const set5 = getSetByName(sets, 'Set 005')
    const set7 = getSetByName(sets, 'Set 007')
    const set40 = getSetByName(sets, 'BulkSet 040')

    await expectCardTask(page, set7.id, 0, 'Waiting for payment', '213 sats')
    await expectCardTask(page, set7.id, 1, 'Invoice expired', '213 sats')
    await expectCardTask(page, set4.id, 7, 'Waiting for payment', '0 sats')
    await expectCardTask(page, set7.id, 2, 'Shared funding in progress', '0 sats')
    await expectCardTask(page, set7.id, 3, 'Shared funding in progress', '213 sats')

    const bulkFundingTask = page.locator(`[data-test-set-id="${set40.id}"]`)
    await expect(bulkFundingTask).toBeAttached()
    await expect(bulkFundingTask).toContainText('Set invoice expired')
    await expect(bulkFundingTask).toContainText('BulkSet 040')
    await expect(bulkFundingTask).toContainText('100 cards')
    await expect(bulkFundingTask).toContainText('2200 sats')

    const bulkWithdrawTask = page.locator(`[data-test-set-id="${set5.id}"]`)
    await expect(bulkWithdrawTask).toBeAttached()
    await expect(bulkWithdrawTask).toContainText('Reclaim in progress')
    await expect(bulkWithdrawTask).toContainText('Set 005')
    await expect(bulkWithdrawTask).toContainText('29 cards')
    await expect(bulkWithdrawTask).toContainText('6090 sats')
  })

  test('it should sort the todos (desc by created)', async ({ context, page }) => {
    test.setTimeout(70_000)
    const userId = await login(context)
    await create100TestSets(userId)
    const authResponse = waitForAuthResponse(page)
    const openTasksResponse = waitForOpenTasksResponse(page)
    await page.goto('/dashboard')
    await authResponse
    await openTasksResponse

    const createdDates = page.locator('[data-test="open-card-task-created"]')
    await expect(createdDates).not.toHaveCount(0)
    const dates = await createdDates.allTextContents()
    for (let index = 0; index < dates.length - 1; index++) {
      expect(new Date(dates[index]).getTime()).toBeGreaterThanOrEqual(new Date(dates[index + 1]).getTime())
    }
  })

  test('it should link to funding page', { tag: '@parallel-safe' }, async ({ context, page }) => {
    const userId = await login(context)
    const set = await createSetWithCardFundingTasks(userId)
    const cardHash = generateCardHashForSet(set.id, 0)
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await page.locator(`[data-test-card-hash="${cardHash}"]`).click()

    await expect(page).toHaveURL(new RegExp(`/funding/${cardHash}`))
  })

  test('it should link to set funding page', { tag: '@parallel-safe' }, async ({ context, page }) => {
    const userId = await login(context)
    const [set] = await createSetsWithSetFunding(userId, 1, 8)
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await page.locator(`[data-test-set-id="${set.id}"]`).click()

    await expect(page).toHaveURL(new RegExp(`/set-funding/${set.id}`))
  })

  test('it should link to bulk withdraw page', { tag: '@parallel-safe' }, async ({ context, page }) => {
    const userId = await login(context)
    const set = await createSetWithBulkWithdrawTask(userId)
    const authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await page.locator(`[data-test-set-id="${set.id}"]`).click()

    await expect(page).toHaveURL(new RegExp(`/bulk-withdraw/${set.id}`))
  })

  test('it should remove the remove the task if its resolved', { tag: '@parallel-safe' }, async ({ context, page }) => {
    const userId = await login(context)
    const [set] = await createSetsWithSetFunding(userId, 1, 8)
    let authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse
    await page.locator(`[data-test-set-id="${set.id}"]`).click()

    const resetInvoiceResponse = page.waitForResponse(response => response.url().includes(`/api/set/invoice/${set.id}`))
    await page.locator('button[data-test="set-funding-reset-invoice"]').click()
    await resetInvoiceResponse
    authResponse = waitForAuthResponse(page)
    await page.goto('/dashboard')
    await authResponse

    await expect(page.locator('[data-test="open-tasks"]')).toHaveCount(0)
  })
})

const waitForAuthResponse = (page: Page) => page.waitForResponse(response => response.url().includes('auth.refreshRefreshToken'))

const waitForOpenTasksResponse = (page: Page) => page.waitForResponse(
  response => response.url().includes('card.openTasks'),
  { timeout: 60_000 },
)

const createUserForLogin = async (keyPair: LnurlAuthKeyPair) => {
  return (await createUser({ lnurlAuthKey: keyPair.publicKeyAsHex })).userId
}

const loginThroughOpenTasksBanner = async (page: Page, keyPair: LnurlAuthKeyPair) => {
  const link = page.locator('[data-test="modal-login"] [data-test="lightning-qr-code-image"]')
  await expect(link).toHaveAttribute('href', /^lightning:.+/)
  const lnurl = await link.getAttribute('href')
  if (!lnurl) {
    throw new Error('LNURL auth link is missing its href attribute.')
  }
  await completeLogin({ keyPair, lnurl, page })
  await page.locator('[data-test="modal-login-close-button"]').click()
}

const getSetByName = (sets: Awaited<ReturnType<typeof create100TestSets>>, name: string) => {
  const set = sets.find(set => set.settings.name === name)
  if (!set) {
    throw new Error(`Expected test set "${name}" to exist.`)
  }
  return set
}

const expectCardTask = async (
  page: Page,
  setId: string,
  cardIndex: number,
  expectedStatus: string,
  expectedAmount: string,
) => {
  const cardHash = generateCardHashForSet(setId, cardIndex)
  const cardTask = page.locator(`[data-test-card-hash="${cardHash}"]`)
  await expect(cardTask).toBeAttached()
  await expect(cardTask).toContainText(expectedStatus)
  await expect(cardTask).toContainText(expectedAmount)
}
