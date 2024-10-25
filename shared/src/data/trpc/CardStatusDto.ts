import z from 'zod'

export const CardStatusEnum = z.enum([
  'unfunded',
  'invoiceFunding', 'lnurlpFunding', 'lnurlpSharedFunding', 'setInvoiceFunding',
  'invoiceExpired', 'lnurlpExpired', 'lnurlpSharedExpiredEmpty', 'lnurlpSharedExpiredFunded', 'setInvoiceExpired',
  'funded',
  'isLockedByBulkWithdraw', 'bulkWithdrawPending', 'withdrawnByBulkWithdraw',
  'withdrawPending', 'recentlyWithdrawn', 'withdrawn',
])

export type CardStatusEnum = z.infer<typeof CardStatusEnum>

export const CardStatusDto = z.object({
  hash: z.string(),

  // calculated fields
  status: CardStatusEnum,
  amount: z.number().nullable().default(null),
  created: z.date().default(() => new Date()),
  funded: z.date().nullable().default(null),
  withdrawn: z.date().nullable().default(null),
})

export type CardStatusDto = z.infer<typeof CardStatusDto>

export const unfundedStatuses: CardStatusEnum[] = [
  CardStatusEnum.enum.unfunded,
  CardStatusEnum.enum.invoiceFunding,
  CardStatusEnum.enum.lnurlpFunding,
  CardStatusEnum.enum.lnurlpSharedFunding,
  CardStatusEnum.enum.setInvoiceFunding,
  CardStatusEnum.enum.invoiceExpired,
  CardStatusEnum.enum.lnurlpExpired,
  CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
  CardStatusEnum.enum.lnurlpSharedExpiredFunded,
  CardStatusEnum.enum.setInvoiceExpired,
]

export const withdrawnStatuses: CardStatusEnum[] = [
  CardStatusEnum.enum.recentlyWithdrawn,
  CardStatusEnum.enum.withdrawn,
  CardStatusEnum.enum.withdrawnByBulkWithdraw,
]

export const pendingStatuses: CardStatusEnum[] = [
  CardStatusEnum.enum.invoiceFunding,
  CardStatusEnum.enum.lnurlpFunding,
  CardStatusEnum.enum.lnurlpSharedFunding,
  CardStatusEnum.enum.setInvoiceFunding,
  CardStatusEnum.enum.invoiceExpired,
  CardStatusEnum.enum.lnurlpExpired,
  CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
  CardStatusEnum.enum.lnurlpSharedExpiredFunded,
  CardStatusEnum.enum.setInvoiceExpired,
  CardStatusEnum.enum.withdrawPending,
  CardStatusEnum.enum.bulkWithdrawPending,
  CardStatusEnum.enum.isLockedByBulkWithdraw,
]