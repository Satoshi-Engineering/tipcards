import type { CardVersion } from '../schema'
import { getAllInvoicesFundingCardVersion, getAllCardVersionsFundedByInvoice } from '../queries'

export const amountForCard = async (card: CardVersion) => {
  const invoices = await getAllInvoicesFundingCardVersion(card)
  const invoicesWithCards = await Promise.all(
    invoices.map(async (invoice) => ({
      ...invoice,
      cards: await getAllCardVersionsFundedByInvoice(invoice),
    })),
  )
  return invoicesWithCards.reduce((total, current) => total + current.amount / current.cards.length, 0)
}

export const totalAmountForCards = async (cards: CardVersion[]) => {
  const cardTotals = await Promise.all(
    cards.map(async (card) => await amountForCard(card)),
  )
  return cardTotals.reduce((total, current) => total + current, 0)
}
