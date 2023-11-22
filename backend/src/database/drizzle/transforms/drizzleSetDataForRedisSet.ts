import { randomUUID } from 'crypto'

import {
  Card, CardVersion,
  Set, SetSettings,
  UserCanUseSet,
  Invoice, CardVersionHasInvoice,
} from '@backend/database/drizzle/schema'
import type { DataObjects } from '@backend/database/drizzle/batchQueries'
import type { Set as SetRedis } from '@backend/database/redis/data/Set'
import hashSha256 from '@backend/services/hashSha256'

import { unixTimestampOrNullToDate, unixTimestampToDate } from './dateHelpers'

export const getDrizzleDataObjectsForRedisSet = async (setRedis: SetRedis): Promise<{
  insertOrUpdate: DataObjects,
  delete: DataObjects,
}> => {
  const set: Set = {
    id: setRedis.id,
    created: unixTimestampToDate(setRedis.created),
    changed: unixTimestampOrNullToDate(setRedis.date) || new Date(),
  }
  const setSettings = getDrizzleSetSettingsForRedisSet(setRedis)
  const userCanUseSet = getUserCanUseSetForRedisSet(setRedis)
  const cards = getCardsForRedisSet(setRedis)
  const invoice = getInvoiceForRedisSet(setRedis)
  const cardVersionInvoices = getCardVersionInvoicesForRedisSet(cards, invoice)

  const cardsToDelete = await getCardsToDeleteForRedisSet(setRedis)
  return {
    insertOrUpdate: setObjectsToDataObjects({
      cards,
      set,
      setSettings,
      userCanUseSet,
      invoice,
      cardVersionInvoices,
    }),
    delete: setObjectsToDataObjects({
      cards: cardsToDelete,
    }),
  }
}

const getDrizzleSetSettingsForRedisSet = (setRedis: SetRedis): SetSettings | null => {
  if (setRedis.settings == null) {
    return null
  }
  return {
    set: setRedis.id,
    name: setRedis.settings.setName,
    numberOfCards: setRedis.settings.numberOfCards,
    cardHeadline: setRedis.settings.cardHeadline,
    cardCopytext: setRedis.settings.cardCopytext,
    image: setRedis.settings.cardsQrCodeLogo,
    landingPage: setRedis.settings.landingPage || 'core',
  }
}

const getUserCanUseSetForRedisSet = (setRedis: SetRedis): UserCanUseSet | null => {
  if (setRedis.userId == null) {
    return null
  }
  return {
    user: setRedis.userId,
    set: setRedis.id,
    canEdit: true,
  }
}

const getCardsForRedisSet = (setRedis: SetRedis): { cards: Card[], cardVersions: CardVersion[] } | null => {
  if (setRedis.invoice == null) {
    return null
  }
  const cards: Card[] = setRedis.invoice.fundedCards.map((index) => ({
    hash: hashSha256(`${setRedis.id}/${index}`),
    created: new Date(),
    set: setRedis.id,
  }))
  const cardVersions: CardVersion[] = cards.map((card) => ({
    id: randomUUID(),
    created: new Date(),
    card: card.hash,
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: setRedis.text,
    noteForStatusPage: setRedis.note,
    sharedFunding: false,
    landingPageViewed: null,
  }))
  return { cards, cardVersions }
}

const getInvoiceForRedisSet = (setRedis: SetRedis): Invoice | null => {
  if (setRedis.invoice == null) {
    return null
  }
  return ({
    created: new Date(),
    amount: setRedis.invoice.amount,
    paid: null,
    expiresAt: new Date(+ new Date() + 10 * 60 * 1000),
    paymentHash: setRedis.invoice.payment_hash,
    paymentRequest: setRedis.invoice.payment_request,
    extra: `{ "set": ${setRedis.id} }`,
  })
}

const getCardVersionInvoicesForRedisSet = (
  cards: { cards: Card[], cardVersions: CardVersion[] } | null,
  invoice: Invoice | null,
): CardVersionHasInvoice[] | null => {
  if (cards == null || invoice == null) {
    return null
  }
  return cards.cardVersions.map((cardVersion) => ({
    invoice: invoice.paymentHash,
    cardVersion: cardVersion.id,
  }))
}

const getCardsToDeleteForRedisSet = async (setRedis: SetRedis): Promise<null> => {
  return null
}

const setObjectsToDataObjects = ({
  set,
  setSettings,
  userCanUseSet,
  cards,
  invoice,
  cardVersionInvoices,
}: {
  set?: Set,
  setSettings?: SetSettings | null,
  userCanUseSet?: UserCanUseSet | null,
  cards?: { cards: Card[], cardVersions: CardVersion[] } | null,
  invoice?: Invoice | null,
  cardVersionInvoices?: CardVersionHasInvoice[] | null,
}): DataObjects => {
  const dataObjects: DataObjects = {}
  if (set != null) {
    dataObjects.sets = [set]
  }
  if (setSettings != null) {
    dataObjects.setSettings = [setSettings]
  }
  if (userCanUseSet != null) {
    dataObjects.usersCanUseSets = [userCanUseSet]
  }
  if (cards != null) {
    dataObjects.cards = cards.cards
    dataObjects.cardVersions = cards.cardVersions
  }
  if (invoice != null) {
    dataObjects.invoices = [invoice]
  }
  if (cardVersionInvoices != null) {
    dataObjects.cardVersionInvoices = cardVersionInvoices
  }
  return dataObjects
}
