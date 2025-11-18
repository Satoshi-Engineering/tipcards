import { expect, type APIRequestContext } from '@playwright/test'
import * as z from 'zod'

import { removeLightningPrefix } from '@e2e-playwright/utils/removeLightningPrefix'

export const PaymentDto = z.object({
  checking_id: z.string(),
  payment_hash: z.string(),
  wallet_id: z.string(),
  amount: z.number(),
  fee: z.number(),
  bolt11: z.string(),
  fiat_provider: z.string().nullable(),
  status: z.enum(['pending', 'success']),
  memo: z.string(),
  expiry: z.string(),
  webhook: z.string().nullable(),
  webhook_status: z.string().nullable(),
  preimage: z.string().nullable(),
  tag: z.string().nullable(),
  extension: z.string().nullable(),
  time: z.string()
    .transform((val) => {
      const [datePart] = val.split('.')
      return new Date(datePart)
    }),
  created_at: z.string()
    .transform((val) => {
      const [datePart] = val.split('.')
      return new Date(datePart)
    }),
  updated_at: z.string()
    .transform((val) => {
      const [datePart] = val.split('.')
      return new Date(datePart)
    }),
  extra: z.record(z.string(), z.any()).optional(),
})

export const payInvoice = async (context: APIRequestContext, invoiceBolt11: string) => {
  const response = await context.post('/api/v1/payments', {
    data: {
      out: true,
      bolt11: removeLightningPrefix(invoiceBolt11),
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to pay invoice: ${await response.text()}`)
  }
  return await response.json()
}

export const getPayments = async (context: APIRequestContext) => {
  const response = await context.get('/api/v1/payments')
  if (!response.ok()) {
    throw new Error(`Failed to get payments: ${await response.text()}`)
  }
  const json = await response.json()

  for (const item of json) {
    try {
      PaymentDto.parse(item)
    } catch (error) {
      console.error('Invalid item:', item)
      console.error('Zod error:', error)
      throw error
    }
  }

  return z.array(PaymentDto).parse(json)
}

export const payLnurlP = async (context: APIRequestContext, lnurl: string, amount?: number) => {
  const lnurlData = await scanLnurl(context, lnurl)
  expect(lnurlData.kind === 'pay')
  expect(lnurlData.minSendable).toBeGreaterThan(0)
  const amountToSend = amount ? amount * 1000 : lnurlData.minSendable
  expect(amountToSend).toBeGreaterThanOrEqual(lnurlData.minSendable)
  expect(amountToSend).toBeLessThanOrEqual(lnurlData.maxSendable)
  const response = await context.post('/api/v1/payments/lnurl', {
    data: {
      callback: lnurlData.callback,
      description_hash: lnurlData.description_hash,
      comment: lnurlData.defaultDescription || '',
      amount: amountToSend,
      description: lnurlData.description,
      unit: 'sat',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to pay LNURL: ${await response.text()}`)
  }
  return await response.json()
}

export const withdrawLnurlW = async (context: APIRequestContext, lnurl: string) => {
  const lnurlData = await scanLnurl(context, lnurl)
  expect(lnurlData.kind === 'withdraw')
  expect(lnurlData.maxWithdrawable).toBeGreaterThan(0)
  const response = await context.post('/api/v1/payments', {
    data: {
      out: false,
      amount: lnurlData.maxWithdrawable / 1000, // Convert from millisats to sats
      memo: lnurlData.defaultDescription,
      lnurl_callback: lnurlData.callback,
      unit: 'sat',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to withdraw LNURL: ${await response.text()}`)
  }
  const responseJson = z.object({
    amount: z.number(),
  }).parse(await response.json())

  return {
    amount: responseJson.amount / 1000, // convert from millisats to stats
  }
}

export const createInvoice = async (context: APIRequestContext, amount: number, memo?: string) => {
  const response = await context.post('/api/v1/payments', {
    data: {
      out: false,
      amount: amount, // Convert from sats to millisats
      memo: memo || 'Invoice created by E2E test',
      unit: 'sat',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create invoice: ${await response.text()}`)
  }
  const json = await response.json()
  if (!json.bolt11 && json.payment_request) {
    // For compatibility with older versions of LNbits that return payment_request instead of bolt11
    json.bolt11 = json.payment_request
    delete json.payment_request
  }
  return z.object({
    bolt11: z.string(),
  }).parse(json)
}

const scanLnurl = async (context: APIRequestContext, lnurl: string) => {
  const response = await context.get(`/api/v1/lnurlscan/${removeLightningPrefix(lnurl)}`)
  if (!response.ok()) {
    throw new Error(`Failed to scan LNURL: ${await response.text()}`)
  }
  return await response.json()
}

