import { expect, test, type APIRequestContext, type Locator } from '@playwright/test'

import { TIPCARDS_ORIGIN } from '../environment'

const externalLinksTestTimeout = 6 * 60_000

test.describe('Landing Page', () => {
  test('checks all wallet pages', async ({ page, request }) => {
    test.setTimeout(externalLinksTestTimeout)
    await page.goto(new URL('/landing', TIPCARDS_ORIGIN).href, { timeout: 60_000 })

    await expectLinksToReturnOk(page.locator('[data-test="no-wallet"] a'), request, 'Wallet')
  })

  test('checks all stores', async ({ page, request }) => {
    test.setTimeout(externalLinksTestTimeout)
    await page.goto(new URL('/landing', TIPCARDS_ORIGIN).href, { timeout: 60_000 })

    await expectLinksToReturnOk(page.locator('[data-test="use-your-bitcoin"] a'), request, 'Store')
  })
})

const expectLinksToReturnOk = async (
  links: Locator,
  request: APIRequestContext,
  linkType: 'Wallet' | 'Store',
) => {
  await expect(links).not.toHaveCount(0, { timeout: 60_000 })

  const hrefs = await links.evaluateAll(elements => elements.map(element => element.getAttribute('href')))
  for (const href of hrefs) {
    if (!href) {
      throw new Error(`${linkType} link is missing its href attribute.`)
    }

    const response = await request.get(href, { timeout: 60_000 })
    expect(response.status(), `${linkType} link ${href}`).toBe(200)
  }
}
