import z from 'zod'

export const CardStatusEnum = z.enum([
  'unfunded',
  'invoiceFunding', 'lnurlpFunding', 'lnurlpSharedFunding', 'setInvoiceFunding',
  'invoiceExpired', 'lnurlpExpired', 'lnurlpSharedExpiredEmpty', 'lnurlpSharedExpiredFunded', 'setInvoiceExpired',
  'funded',
  'withdrawPending', 'recentlyWithdrawn', 'withdrawn',
])

export type CardStatusEnum = z.infer<typeof CardStatusEnum>

export const CardStatus = z.object({
  hash: z.string(),

  // calculated fields
  status: CardStatusEnum,
  amount: z.number().nullable().default(null),
  created: z.date().default(() => new Date()),
  funded: z.date().nullable().default(null),
  withdrawn: z.date().nullable().default(null),
})

export type CardStatus = z.infer<typeof CardStatus>
