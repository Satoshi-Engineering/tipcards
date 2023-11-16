import type { Card } from '@backend/database/drizzle/schema/Card'
import type { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import type { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import type { Invoice } from '@backend/database/drizzle/schema/Invoice'
import type { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import type { LnurlW } from '@backend/database/drizzle/schema/LnurlW'

const cardsByHash: Record<string, Card> = {}
const cardVersionsById: Record<string, CardVersion> = {}
const cardVersionInvoices: CardVersionHasInvoice[] = []
const invoicesByPaymentHash: Record<string, Invoice> = {}
const lnurlPsByLnbitsId: Record<string, LnurlP> = {}
const lnurlWsByLnbitsId: Record<string, LnurlW> = {}

export const addCards = (...cards: Card[]) => {
  addItemsToTable(cardsByHash, cards.map((card) => ({ key: card.hash, item: card })))
}
export const addCardVersions = (...cardVersions: CardVersion[]) => {
  addItemsToTable(cardVersionsById, cardVersions.map((cardVersion) => ({ key: cardVersion.id, item: cardVersion })))
}
export const addInvoices = (...invoices: Invoice[]) => {
  addItemsToTable(invoicesByPaymentHash, invoices.map((invoice) => ({ key: invoice.paymentHash, item: invoice })))
}
export const addCardVersionInvoices = (...newCardVersionInvoices: CardVersionHasInvoice[]) => {
  cardVersionInvoices.push(...newCardVersionInvoices)
}
export const addLnurlPs = (...lnurlps: LnurlP[]) => {
  addItemsToTable(lnurlPsByLnbitsId, lnurlps.map((lnurlp) => ({ key: lnurlp.lnbitsId, item: lnurlp })))
}
export const addLnurlWs = (...lnurlws: LnurlW[]) => {
  addItemsToTable(lnurlWsByLnbitsId, lnurlws.map((lnurlw) => ({ key: lnurlw.lnbitsId, item: lnurlw })))
}
export const addData = ({
  cards,
  cardVersions,
  invoices,
  cardVersionInvoices,
  lnurlps,
  lnurlws,
}: {
  cards?: Card[],
  cardVersions?: CardVersion[],
  invoices?: Invoice[],
  cardVersionInvoices?: CardVersionHasInvoice[],
  lnurlps?: LnurlP[],
  lnurlws?: LnurlW[],
}) => {
  addCards(...(cards || []))
  addCardVersions(...(cardVersions || []))
  addInvoices(...(invoices || []))
  addCardVersionInvoices(...(cardVersionInvoices || []))
  addLnurlPs(...(lnurlps || []))
  addLnurlWs(...(lnurlws || []))
}

const addItemsToTable = <I>(table: Record<string, I>, items: { key: string, item: I }[]) => {
  items.forEach((item) => addItemToTable(table, item))
}
const addItemToTable = <I>(table: Record<string, I>, { key, item }: { key: string, item: I }) => {
  table[key] = item
}

const getLatestCardVersion = async (cardHash: Card['hash']): Promise<CardVersion | null> => {
  const cards = Object.values(cardVersionsById).filter((cardVersion) => cardVersion.card === cardHash)
  if (cards.length === 0) {
    return null
  }
  return cards.sort((a, b) => a.created.getTime() - b.created.getTime())[0]
}

export const getLnurlPForCard = async (cardVersion: CardVersion): Promise<LnurlP | null> => {
  if (cardVersion.lnurlP == null || lnurlPsByLnbitsId[cardVersion.lnurlP] == null) {
    return null
  }
  return lnurlPsByLnbitsId[cardVersion.lnurlP]
}

export const getLnurlWForCard = async (cardVersion: CardVersion): Promise<LnurlW | null> => {
  if (cardVersion.lnurlW == null || lnurlWsByLnbitsId[cardVersion.lnurlW] == null) {
    return null
  }
  return lnurlWsByLnbitsId[cardVersion.lnurlW]
}

export const getCardsForLnurlW = async (lnurlw: LnurlW): Promise<CardVersion[]> => {
  return Object.values(cardVersionsById).filter((cardVersion) => cardVersion.lnurlW === lnurlw.lnbitsId)
}

export const getInvoicesForCard = async (cardVersion: CardVersion): Promise<Invoice[]> => {
  const paymentHashes = cardVersionInvoices
    .filter((cardVersionInvoice) => cardVersionInvoice.cardVersion === cardVersion.id)
    .map((cardVersionInvoice) => cardVersionInvoice.invoice)
  return Object.values(invoicesByPaymentHash).filter((invoice) => paymentHashes.includes(invoice.paymentHash))
}

export const getCardsForInvoice = async (invoice: Invoice): Promise<CardVersion[]> => {
  const cardVersionIds = cardVersionInvoices
    .filter((cardVersionInvoice) => cardVersionInvoice.invoice === invoice.paymentHash)
    .map((cardVersionInvoice) => cardVersionInvoice.cardVersion)
  return Object.values(cardVersionsById).filter((cardVersion) => cardVersionIds.includes(cardVersion.id))
}

export const insertCards = jest.fn(async () => undefined)
export const insertCardVerions = jest.fn(async () => undefined)
export const insertInvoices = jest.fn(async () => undefined)
export const insertCardVersionInvoices = jest.fn(async () => undefined)
export const insertLnurlPs = jest.fn(async () => undefined)
export const insertLnurlWs = jest.fn(async () => undefined)

jest.mock('@backend/database/drizzle/queries', () => {
  return {
    getLatestCardVersion,
    getLnurlPForCard,
    getLnurlWForCard,
    getCardsForLnurlW,
    getInvoicesForCard,
    getCardsForInvoice,
    insertCards,
    insertCardVerions,
    insertInvoices,
    insertCardVersionInvoices,
    insertLnurlPs,
    insertLnurlWs,
  }
})
