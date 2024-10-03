import { randomUUID } from 'crypto'

import type {
  Card, CardVersion,
  Set, SetSettings,
  UserCanUseSet,
  Invoice, CardVersionHasInvoice,
} from '@backend/database/schema/index.js'
import type Queries from '@backend/database/Queries.js'
import type { DataObjects } from '@backend/database/batchQueries.js'
import type { Set as SetRedis } from '@backend/database/deprecated/data/Set.js'
import hashSha256 from '@backend/services/hashSha256.js'

import { unixTimestampOrNullToDate, unixTimestampToDate } from './dateHelpers.js'

/** @throws */
export const getDrizzleDataObjectsForRedisSet = async (queries: Queries, setRedis: SetRedis): Promise<{
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
  const cardsAndVersions = await getCardsForRedisSet(queries, setRedis)
  const invoice = getInvoiceForRedisSet(setRedis)
  const cardVersionInvoices = getCardVersionInvoicesForRedisSet(cardsAndVersions, invoice)

  const cardVersionInvoicesToDelete = await getCardVersionInvoicesToDeleteForRedisSet(queries, setRedis)
  return {
    insertOrUpdate: setObjectsToDataObjects({
      cardsAndVersions,
      set,
      setSettings,
      userCanUseSet,
      invoice,
      cardVersionInvoices,
    }),
    delete: setObjectsToDataObjects({
      cardVersionInvoices: cardVersionInvoicesToDelete,
    }),
  }
}

/** @throws */
export const getDrizzleDataObjectsForRedisSetDelete = async (queries: Queries, setRedis: SetRedis): Promise<{
  update: DataObjects,
  delete: DataObjects,
}> => {
  const cards = await getCardsWithRemovedSetLinkForRedisSet(queries, setRedis)

  const set = await queries.getSetById(setRedis.id)
  const setSettings = await queries.getSetSettingsBySetId(setRedis.id)
  const cardVersionInvoicesToDelete = await getCardVersionInvoicesToDeleteForRedisSet(queries, setRedis)
  const usersCanUseSetsToDelete = await queries.getAllUsersThatCanUseSetBySetId(setRedis.id)
  return {
    update: setObjectsToDataObjects({
      cards,
    }),
    delete: setObjectsToDataObjects({
      set,
      setSettings,
      cardVersionInvoices: cardVersionInvoicesToDelete,
      usersCanUseSet: usersCanUseSetsToDelete,
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
    image: setRedis.settings.cardsQrCodeLogo || null,
    landingPage: setRedis.settings.landingPage || 'default',
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

const getCardsForRedisSet = async (
  queries: Queries,
  setRedis: SetRedis,
): Promise<{ cards: Card[], cardVersions: CardVersion[] } | null> => {
  if (setRedis.invoice == null) {
    return null
  }

  const cards: Card[] = await Promise.all(setRedis.invoice.fundedCards.map(async (index) => {
    const card = await queries.getCardByHash(hashSha256(`${setRedis.id}/${index}`))
    if (card != null) {
      return {
        ...card,
        set: setRedis.id,
      }
    }
    return {
      hash: hashSha256(`${setRedis.id}/${index}`),
      created: new Date(),
      set: setRedis.id,
      locked: null,
    }
  }))

  const cardVersions: CardVersion[] = await Promise.all(cards.map(async (card) => {
    const cardVersion = await queries.getLatestCardVersion(card.hash)
    if (cardVersion != null) {
      return {
        ...cardVersion,
        textForWithdraw: setRedis.text,
        noteForStatusPage: setRedis.note,
      }
    }
    return {
      id: randomUUID(),
      created: new Date(),
      card: card.hash,
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: setRedis.text,
      noteForStatusPage: setRedis.note,
      sharedFunding: false,
      landingPageViewed: null,
    }
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
    paid: unixTimestampOrNullToDate(setRedis.invoice.paid),
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

const getCardVersionInvoicesToDeleteForRedisSet = async (queries: Queries, setRedis: SetRedis): Promise<CardVersionHasInvoice[] | null> => {
  if (setRedis.invoice != null) {
    return null
  }
  return getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForRedisSet(queries, setRedis)
}

const getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForRedisSet = async (queries: Queries, setRedis: SetRedis): Promise<CardVersionHasInvoice[] | null> => {
  const numberOfCards: number = await getNumberOfCardsForRedisSet(queries, setRedis)
  const cardHashes = [...new Array(numberOfCards).keys()].map((index) => hashSha256(`${setRedis.id}/${index}`))
  return getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForCardHashes(queries, cardHashes)
}

const getNumberOfCardsForRedisSet = async (queries: Queries, setRedis: SetRedis): Promise<number> => {
  const setSettings = await queries.getSetSettingsBySetId(setRedis.id)
  return setSettings?.numberOfCards || 8
}

const getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForCardHashes = async (queries: Queries, cardHashes: Card['hash'][]): Promise<CardVersionHasInvoice[] | null> => {
  for (const cardHash of cardHashes) {
    const cardVersionInvoices = await getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForCardHash(queries, cardHash)
    if (cardVersionInvoices != null) {
      return cardVersionInvoices
    }
  }
  return null
}

const getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForCardHash = async (queries: Queries, cardHash: Card['hash']): Promise<CardVersionHasInvoice[] | null> => {
  const cardVersion = await queries.getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    return null
  }
  return getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForCardVersion(queries, cardVersion)
}

const getCardVersionInvoicesThatBelongToAnUnpaidInvoiceWhichFundsMultipleCardVersionsForCardVersion = async (queries: Queries, cardVersion: CardVersion): Promise<CardVersionHasInvoice[] | null> => {
  const invoices = await queries.getUnpaidInvoicesForCardVersion(cardVersion)
  return getCardVersionInvoicesForInvoiceThatFundsMultipleCardVersions(queries, invoices)
}

const getCardVersionInvoicesForInvoiceThatFundsMultipleCardVersions = async (queries: Queries, invoices: Invoice[]): Promise<CardVersionHasInvoice[] | null> => {
  for (const invoice of invoices) {
    const cardVersionInvoices = await queries.getAllCardVersionInvoicesForInvoice(invoice)
    if (cardVersionInvoices.length > 1) {
      return cardVersionInvoices
    }
  }
  return null
}

/** @throws */
const getCardsWithRemovedSetLinkForRedisSet = async (queries: Queries, setRedis: SetRedis): Promise<Card[]> => {
  const cards = await queries.getAllCardsForSetBySetId(setRedis.id)
  return cards.map((card) => ({
    ...card,
    set: null,
  }))
}

const setObjectsToDataObjects = ({
  set,
  setSettings,
  userCanUseSet,
  usersCanUseSet,
  cards,
  cardsAndVersions,
  invoice,
  cardVersionInvoices,
}: {
  set?: Set | null,
  setSettings?: SetSettings | null,
  userCanUseSet?: UserCanUseSet | null,
  usersCanUseSet?: UserCanUseSet[] | null,
  cards?: Card[] | null,
  cardsAndVersions?: { cards: Card[], cardVersions: CardVersion[] } | null,
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
  if (usersCanUseSet != null && usersCanUseSet.length > 0) {
    dataObjects.usersCanUseSets = usersCanUseSet
  }
  if (cards != null && cards.length > 0) {
    dataObjects.cards = cards
  }
  if (cardsAndVersions != null) {
    dataObjects.cards = cardsAndVersions.cards
    dataObjects.cardVersions = cardsAndVersions.cardVersions
  }
  if (invoice != null) {
    dataObjects.invoices = [invoice]
  }
  if (cardVersionInvoices != null) {
    dataObjects.cardVersionInvoices = cardVersionInvoices
  }
  return dataObjects
}
