import type { Page } from '@playwright/test'

export const delayNextTrpcResponse = async (page: Page, delay = 1_000) => {
  const backendApiOrigin = process.env.BACKEND_API_ORIGIN
  if (!backendApiOrigin) {
    throw new Error('BACKEND_API_ORIGIN is not set')
  }

  await page.route(`${backendApiOrigin}/trpc/**`, async (route) => {
    const response = await route.fetch()
    await new Promise(resolve => setTimeout(resolve, delay))
    await route.fulfill({ response })
  }, { times: 1 })
}
