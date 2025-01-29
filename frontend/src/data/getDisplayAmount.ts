import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto'

export const cardStatusesUnpaidInvoices: CardStatusEnum[] = [
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

export default ({
  cardStatus,
  amount,
  feeAmount,
}: {
  cardStatus?: CardStatusEnum
  amount?: number
  feeAmount?: number
}): number | undefined => {
  if (cardStatus == null || amount == null || feeAmount == null) {
    return undefined
  }
  if (cardStatusesUnpaidInvoices.includes(cardStatus)) {
    return amount + feeAmount
  }
  return amount
}
