import type { Set, Card, CardVersion, Invoice } from '@backend/database/schema/index.js'
import type Queries from '@backend/database/Queries.js'
import type { Set as SetRedis } from '@backend/database/deprecated/data/Set.js'
import hashSha256 from '@backend/services/hashSha256.js'

import { dateOrNullToUnixTimestamp, dateToUnixTimestamp } from './dateHelpers.js'

/** @throws */
export const getRedisSetFromDrizzleSet = async (queries: Queries, set: Set): Promise<SetRedis> => {
  const settings = await getRedisSetSettingsFromDrizzleSet(queries, set)
  const invoice = await getRedisInvoiceFromDrizzleSet(queries, set)
  const userId = await getRedisSetUserFromDrizzleSet(queries, set)
  const { text, note } = await getTextAndNoteForRedisSetFromRedisInvoice(queries, invoice, set.id)
  return {
    id: set.id,
    settings,
    created: dateToUnixTimestamp(set.created),
    date: dateToUnixTimestamp(set.changed),

    userId,

    text,
    note,
    invoice,
  }
}

export const getRedisSetSettingsFromDrizzleSet = async (queries: Queries, set: Set): Promise<SetRedis['settings']> => {
  const setSettings = await queries.getSetSettingsForSet(set)
  if (setSettings == null) {
    return null
  }
  return {
    numberOfCards: setSettings.numberOfCards,
    cardHeadline: setSettings.cardHeadline,
    cardCopytext: setSettings.cardCopytext,
    cardsQrCodeLogo: setSettings.image || '',
    setName: setSettings.name,
    landingPage: setSettings.landingPage,
  }
}

const getRedisInvoiceFromDrizzleSet = async (queries: Queries, set: Set): Promise<SetRedis['invoice']> => {
  const cards = await queries.getAllCardsForSet(set)
  for (const card of cards) {
    const invoices = await getAllDrizzleInvoicesFundingCard(queries, card)
    if (invoices.length !== 1) {
      continue
    }
    const cardVersions = await queries.getAllCardVersionsFundedByInvoice(invoices[0])
    if (cardVersions.length < 2) {
      continue
    }
    return getRedisInvoiceForDrizzleInvoice(invoices[0], cardVersions, set)
  }
  return null
}

const getAllDrizzleInvoicesFundingCard = async (queries: Queries, card: Card): Promise<Invoice[]> => {
  const cardVersion = await queries.getLatestCardVersion(card.hash)
  if (cardVersion == null) {
    return []
  }
  return queries.getAllInvoicesFundingCardVersion(cardVersion)
}

const getRedisInvoiceForDrizzleInvoice = async (
  invoice: Invoice,
  cardVersions: CardVersion[],
  set: Set,
): Promise<SetRedis['invoice']> => {
  const fundedCards: number[] = []
  const cardsHasesFundedByInvoice = cardVersions.map((cardVersion) => cardVersion.card)
  for (let y = 0; y < 1000; y += 1) {
    const cardHash = hashSha256(`${set.id}/${y}`)
    if (cardsHasesFundedByInvoice.includes(cardHash)) {
      fundedCards.push(y)
    }
    if (fundedCards.length === cardsHasesFundedByInvoice.length) {
      break
    }
  }
  return {
    fundedCards,
    amount: invoice.amount,
    payment_hash: invoice.paymentHash,
    payment_request: invoice.paymentRequest,
    created: dateToUnixTimestamp(invoice.created),
    paid: dateOrNullToUnixTimestamp(invoice.paid),
    expired: new Date() > invoice.expiresAt,
  }
}

const getRedisSetUserFromDrizzleSet = async (queries: Queries, set: Set): Promise<SetRedis['userId']> => {
  const usersCanUseSets = await queries.getAllUsersThatCanUseSet(set)
  return usersCanUseSets.find((userCanUseSet) => userCanUseSet.canEdit)?.user || null
}

const getTextAndNoteForRedisSetFromRedisInvoice = async (queries: Queries, invoice: SetRedis['invoice'], setId: string): Promise<{ text: string, note: string }> => {
  if (invoice == null || invoice.fundedCards.length === 0) {
    return { text: '', note: '' }
  }
  const cardVersion = await queries.getLatestCardVersion(hashSha256(`${setId}/${invoice.fundedCards[0]}`))
  return {
    text: cardVersion?.textForWithdraw || '',
    note: cardVersion?.noteForStatusPage || '',
  }
}
