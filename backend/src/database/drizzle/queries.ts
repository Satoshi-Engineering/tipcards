import { eq, desc } from 'drizzle-orm'

import type { Card } from './schema/Card'
import { CardVersion as CardVersionDrizzle, type CardVersion } from './schema/CardVersion'
import { Invoice } from './schema/Invoice'
import { CardVersionHasInvoice } from './schema/CardVersionHasInvoice'
import { LnurlP } from './schema/LnurlP'
import { LnurlW } from './schema/LnurlW'
import { getClient } from './client'

/** @throws */
export const getLatestCardVersion = async (cardHash: Card['hash']): Promise<CardVersion | null> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersionDrizzle)
    .orderBy(desc(CardVersionDrizzle.created))
    .where(eq(CardVersionDrizzle.card, cardHash))
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

/** @throws */
export const getLnurlPForCard = async (cardVersion: CardVersion): Promise<LnurlP | null> => {
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
export const getInvoicesForCard = async (cardVersion: CardVersion): Promise<Invoice[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersionHasInvoice)
    .innerJoin(Invoice, eq(CardVersionHasInvoice.invoice, Invoice.paymentHash))
    .where(eq(CardVersionHasInvoice.cardVersion, cardVersion.id))
  return result.map(({ Invoice }) => Invoice)
}

/** @throws */
export const getCardsForInvoice = async (invoice: Invoice): Promise<CardVersion[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersionHasInvoice)
    .innerJoin(CardVersionDrizzle, eq(CardVersionHasInvoice.cardVersion, CardVersionDrizzle.id))
    .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
  return result.map(({ CardVersion }) => CardVersion)
}

/** @throws */
export const getLnurlWForCard = async (cardVersion: CardVersion): Promise<LnurlW | null> => {
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
export const getCardsForLnurlW = async (lnurlw: LnurlW): Promise<CardVersion[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersionDrizzle)
    .where(eq(CardVersionDrizzle.lnurlW, lnurlw.lnbitsId))
  return result
}
