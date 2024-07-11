import { Card } from './Card.js'

export const getPaidTimestamp = (card: Card): number | null => {
  let paidTimestamp: number | null = null
  if (card.invoice?.paid != null) {
    paidTimestamp = card.invoice.paid
  } else if (card.lnurlp?.paid != null) {
    paidTimestamp = card.lnurlp.paid
  } else if (card.setFunding?.paid != null) {
    paidTimestamp = card.setFunding.paid
  }
  return paidTimestamp
}

export const getPaidAmount = (card: Card): number => {
  let paidAmount = 0
  if (card.invoice?.paid != null) {
    paidAmount = card.invoice.amount
  } else if (card.lnurlp?.paid != null) {
    paidAmount = card.lnurlp.amount || 0
  } else if (card.setFunding?.paid != null) {
    paidAmount = card.setFunding.amount
  }
  return paidAmount
}
