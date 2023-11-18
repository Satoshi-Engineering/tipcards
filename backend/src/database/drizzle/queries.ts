import { and, eq, isNull, desc } from 'drizzle-orm'

import { Card } from './schema/Card'
import { CardVersion } from './schema/CardVersion'
import { Invoice } from './schema/Invoice'
import { CardVersionHasInvoice } from './schema/CardVersionHasInvoice'
import { LnurlP } from './schema/LnurlP'
import { LnurlW } from './schema/LnurlW'
import { getClient } from './client'

/** @throws */
export const getLatestCardVersion = async (cardHash: Card['hash']): Promise<CardVersion | null> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersion)
    .orderBy(desc(CardVersion.created))
    .where(eq(CardVersion.card, cardHash))
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

/** @throws */
export const getLnurlPFundingCardVersion = async (cardVersion: CardVersion): Promise<LnurlP | null> => {
  if (cardVersion.lnurlP == null) {
    return null
  }
  const client = await getClient()
  const result = await client.select()
    .from(LnurlP)
    .where(eq(LnurlP.lnbitsId, cardVersion.lnurlP))
  if (result.length === 0) {
    return null
  }
  return result[0]
}

/** @throws */
export const getAllInvoicesFundingCardVersion = async (cardVersion: CardVersion): Promise<Invoice[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersionHasInvoice)
    .innerJoin(Invoice, eq(CardVersionHasInvoice.invoice, Invoice.paymentHash))
    .where(eq(CardVersionHasInvoice.cardVersion, cardVersion.id))
  return result.map(({ Invoice }) => Invoice)
}

/** @throws */
export const getInvoiceByPaymentHash = async (paymentHash: Invoice['paymentHash']): Promise<Invoice | null> => {
  const client = await getClient()
  const result = await client.select()
    .from(Invoice)
    .where(eq(Invoice.paymentHash, paymentHash))
  if (result.length === 0) {
    return null
  }
  return result[0]
}

/** @throws */
export const getUnpaidInvoicesForCardVersion = async (cardVersion: CardVersion) => {
  const client = await getClient()
  const result = await client.select()
    .from(Invoice)
    .innerJoin(CardVersionHasInvoice, eq(Invoice.paymentHash, CardVersionHasInvoice.invoice))
    .where(and(
      eq(CardVersionHasInvoice.cardVersion, cardVersion.id),
      isNull(Invoice.paid),
    ))
return result.map(({ Invoice }) => Invoice)
}

/** @throws */
export const getAllCardVersionsFundedByInvoice = async (invoice: Invoice): Promise<CardVersion[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersionHasInvoice)
    .innerJoin(CardVersion, eq(CardVersionHasInvoice.cardVersion, CardVersion.id))
    .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
  return result.map(({ CardVersion }) => CardVersion)
}

/** @throws */
export const getLnurlWWithdrawingCardVersion = async (cardVersion: CardVersion): Promise<LnurlW | null> => {
  if (cardVersion.lnurlW == null) {
    return null
  }
  const client = await getClient()
  const result = await client.select()
    .from(LnurlW)
    .where(eq(LnurlW.lnbitsId, cardVersion.lnurlW))
  if (result.length === 0) {
    return null
  }
  if (result.length > 1) {
    throw new Error(`More than one withdraw exists for card ${cardVersion.card}`)
  }
  return result[0]
}

/** @throws */
export const getAllCardsWithdrawnByLnurlW = async (lnurlw: LnurlW): Promise<CardVersion[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersion)
    .where(eq(CardVersion.lnurlW, lnurlw.lnbitsId))
  return result
}

/** @throws */
export const insertCards = async (...cards: Card[]): Promise<void> => {
  const client = await getClient()
  await client.insert(Card)
    .values(cards)
}

/** @throws */
export const insertCardVersions = async (...cardVersions: CardVersion[]): Promise<void> => {
  const client = await getClient()
  await client.insert(CardVersion)
    .values(cardVersions)
}

/** @throws */
export const insertInvoices = async (...invoices: Invoice[]): Promise<void> => {
  const client = await getClient()
  await client.insert(Invoice)
    .values(invoices)
}

/** @throws */
export const insertCardVersionInvoices = async (...cardVersionInvoices: CardVersionHasInvoice[]): Promise<void> => {
  const client = await getClient()
  await client.insert(CardVersionHasInvoice)
    .values(cardVersionInvoices)
}

/** @throws */
export const insertLnurlPs = async (...lnurlps: LnurlP[]): Promise<void> => {
  const client = await getClient()
  await client.insert(LnurlP)
    .values(lnurlps)
}

/** @throws */
export const insertLnurlWs = async (...lnurlws: LnurlW[]): Promise<void> => {
  const client = await getClient()
  await client.insert(LnurlW)
    .values(lnurlws)
}

/** @throws */
export const updateCardVesion = async (cardVersion: CardVersion): Promise<void> => {
  const client = await getClient()
  await client.update(CardVersion)
    .set(cardVersion)
    .where(eq(CardVersion.id, cardVersion.id))
}

/** @throws */
export const insertOrUpdateInvoice = async (invoice: Invoice): Promise<void> => {
  const client = await getClient()
  await client.insert(Invoice)
    .values(invoice)
    .onDuplicateKeyUpdate({ set: invoice })
}

/** @throws */
export const insertOrUpdateCardVersionInvoice = async (cardVersionInvoice: CardVersionHasInvoice): Promise<void> => {
  const client = await getClient()
  await client.insert(CardVersionHasInvoice)
    .values(cardVersionInvoice)
    .onDuplicateKeyUpdate({ set: cardVersionInvoice })
}

/** @throws */
export const insertOrUpdateLnurlP = async (lnurlp: LnurlP): Promise<void> => {
  const client = await getClient()
  await client.insert(LnurlP)
    .values(lnurlp)
    .onDuplicateKeyUpdate({ set: lnurlp })
}

/** @throws */
export const insertOrUpdateLnurlW = async (lnurlw: LnurlW): Promise<void> => {
  const client = await getClient()
  await client.insert(LnurlW)
    .values(lnurlw)
    .onDuplicateKeyUpdate({ set: lnurlw })
}

/** @throws */
export const deleteInvoice = async (invoice: Invoice): Promise<void> => {
  const client = await getClient()
  await client.delete(Invoice)
    .where(eq(Invoice.paymentHash, invoice.paymentHash))
}

/** @throws */
export const deleteCardVersionInvoice = async (cardVersionInvoice: CardVersionHasInvoice): Promise<void> => {
  const client = await getClient()
  await client.delete(CardVersionHasInvoice)
    .where(and(
      eq(CardVersionHasInvoice.invoice, cardVersionInvoice.invoice),
      eq(CardVersionHasInvoice.cardVersion, cardVersionInvoice.cardVersion),
    ))
}
