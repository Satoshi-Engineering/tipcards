import { request, expect, type APIRequestContext } from '@playwright/test'
import * as z from 'zod'

import LNURL from '@shared/modules/LNURL/LNURL'

import { payInvoice, withdrawLnurlW } from '@e2e-playwright/utils/lnbits/api/payments'

export const cardDynamicLnurl = (cardHash: string) => LNURL.encode(`${process.env.BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()

export const fundCard = async (cardHash: string, lnbitsApiContext: APIRequestContext) => {
  const context = await request.newContext()
  const response = await context.post(
    `${process.env.BACKEND_API_ORIGIN}/api/invoice/create/${cardHash}`,
    {
      data: {
        amount: 2100,
        text: 'Have fun with testing',
      },
    },
  )
  const { data: invoice } = z.object({
    data: z.string(),
    status: z.string(),
  }).parse(await response.json())
  await payInvoice(lnbitsApiContext, invoice)
  await expect.poll(async () => await getCardStatus(cardHash)).toBe('funded')
}

export const withdrawCard = async (cardHash: string, lnbitsApiContext: APIRequestContext) => {
  const lnurl = cardDynamicLnurl(cardHash)
  await withdrawLnurlW(lnbitsApiContext, lnurl)
  await expect.poll(async () => await getCardStatus(cardHash)).not.toBe('funded')
}

export const getCardStatus = async (cardHash: string) => {
  const context = await request.newContext()
  const input = encodeURIComponent(JSON.stringify({ json: { hash: cardHash } }))
  const response = await context.get(`${process.env.BACKEND_API_ORIGIN}/trpc/card.status?input=${input}`)
  const { result } = z.object({
    result: z.object({
      data: z.object({
        json: z.object({
          status: z.string(),
        }),
      }),
    }),
  }).parse(await response.json())
  return result.data.json.status
}
