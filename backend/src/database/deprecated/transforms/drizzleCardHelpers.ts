import type { CardVersion } from '@backend/database/schema/index.js'
import type Queries from '@backend/database/Queries.js'

export const totalAmountForCards = async (queries: Queries, cards: CardVersion[]) => {
  const cardTotals = await Promise.all(
    cards.map(async (card) => await amountForCard(queries, card)),
  )
  return cardTotals.reduce((total, current) => total + current, 0)
}

export const amountForCard = async (queries: Queries, card: CardVersion) => {
  const invoices = await queries.getAllInvoicesFundingCardVersion(card)
  const invoicesWithCards = await Promise.all(
    invoices.map(async (invoice) => ({
      ...invoice,
      cards: await queries.getAllCardVersionsFundedByInvoice(invoice),
    })),
  )
  return invoicesWithCards.reduce((total, current) => total + current.amount / current.cards.length, 0)
}
