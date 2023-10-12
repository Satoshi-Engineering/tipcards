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
  lnurl: z.string(),
  status: CardStatusEnum,
  amount: z.number().nullable().default(null),
  createdDate: z.number().nullable().default(null),
  fundedDate: z.number().nullable().default(null),
  withdrawnDate: z.number().nullable().default(null),
})

export type CardStatus = z.infer<typeof CardStatus>
