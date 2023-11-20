import type { Set, Card, CardVersion, Invoice } from '@backend/database/drizzle/schema'
import { Set as SetRedis } from '@backend/database/redis/data/Set'
import {
  getSetSettingsForSet,
  getAllCardsForSet,
  getLatestCardVersion,
  getAllInvoicesFundingCardVersion,
  getAllCardVersionsFundedByInvoice,
  getAllUsersThatCanUseSet,
} from '@backend/database/drizzle/queries'
import hashSha256 from '@backend/services/hashSha256'

import { dateOrNullToUnixTimestamp, dateToUnixTimestamp } from './dateHelpers'

/** @throws */
export const getRedisSetFromDrizzleSet = async (set: Set): Promise<SetRedis> => {
  const settings = await getRedisSetSettingsFromDrizzleSet(set)
  const invoice = await getRedisInvoiceFromDrizzleSet(set)
  const userId = await getRedisSetUserFromDrizzleSet(set)
  const { text, note } = await getTextAndNoteForRedisSetFromRedisInvoice(invoice, set.id)
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

export const getRedisSetSettingsFromDrizzleSet = async (set: Set): Promise<SetRedis['settings']> => {
  const setSettings = await getSetSettingsForSet(set)
  if (setSettings == null) {
    return null
  }
  return {
    numberOfCards: setSettings.numberOfCards,
    cardHeadline: setSettings.cardHeadline,
    cardCopytext: setSettings.cardCopytext,
    cardsQrCodeLogo: setSettings.image,
    setName: setSettings.name,
    landingPage: setSettings.landingPage,
  }
}

const getRedisInvoiceFromDrizzleSet = async (set: Set): Promise<SetRedis['invoice']> => {
  const cards = await getAllCardsForSet(set)
  for (const card of cards) {
    const invoices = await getAllDrizzleInvoicesFundingCard(card)
    if (invoices.length !== 1) {
      continue
    }
    const cardVersions = await getAllCardVersionsFundedByInvoice(invoices[0])
    if (cardVersions.length < 2) {
      continue
    }
    return getRedisInvoiceForDrizzleInvoice(invoices[0], cardVersions, set)
  }
  return null
}

const getAllDrizzleInvoicesFundingCard = async (card: Card): Promise<Invoice[]> => {
  const cardVersion = await getLatestCardVersion(card.hash)
  if (cardVersion == null) {
    return []
  }
  return getAllInvoicesFundingCardVersion(cardVersion)
}

const getRedisInvoiceForDrizzleInvoice = async (
  invoice: Invoice,
  cardVersions: CardVersion[],
  set: Set,
): Promise<SetRedis['invoice']> => {
  const fundedCards: number[] = []
  const cardsHasesFundedByInvoice = cardVersions.map((cardVersion) => cardVersion.card)
  const numberOfCards = await getNumberOfCardsForSet(set)
  for (let y = 0; y < numberOfCards; y += 1) {
    const cardHash = hashSha256(`${set.id}/${y}`)
    if (cardsHasesFundedByInvoice.includes(cardHash)) {
      fundedCards.push(y)
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

const getNumberOfCardsForSet = async (set: Set): Promise<number> => {
  const setSettings = await getSetSettingsForSet(set)
  return setSettings?.numberOfCards || 8
}

const getRedisSetUserFromDrizzleSet = async (set: Set): Promise<SetRedis['userId']> => {
  const usersCanUseSets = await getAllUsersThatCanUseSet(set)
  return usersCanUseSets.find((userCanUseSet) => userCanUseSet.canEdit)?.user || null
}

const getTextAndNoteForRedisSetFromRedisInvoice = async (invoice: SetRedis['invoice'], setId: string): Promise<{ text: string, note: string }> => {
  if (invoice == null || invoice.fundedCards.length === 0) {
    return { text: '', note: '' }
  }
  const cardVersion = await getLatestCardVersion(hashSha256(`${setId}/${invoice.fundedCards[0]}`))
  return {
    text: cardVersion?.textForWithdraw || '',
    note: cardVersion?.noteForStatusPage || '',
  }
}
