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
  amount: z.number().optional(),
  createdDate: z.number().optional(),
  fundedDate: z.number().optional(),
  withdrawnDate: z.number().optional(),
})

export type CardStatus = z.infer<typeof CardStatus>
