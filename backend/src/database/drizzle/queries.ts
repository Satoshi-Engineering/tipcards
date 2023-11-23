import { and, eq, isNull, desc } from 'drizzle-orm'

import NotFoundError from '@backend/errors/NotFoundError'

import {
  Set, SetSettings,
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  UserCanUseSet, LandingPage, UserCanUseLandingPage,
} from '@backend/database/drizzle/schema'
import { getClient } from './client'

/** @throws */
export const getSetById = async (setId: Set['id']): Promise<Set | null> => {
  const client = await getClient()
  const result = await client.select()
    .from(Set)
    .where(eq(Set.id, setId))
  if (result.length === 0) {
    return null
  }
  return result[0]
}

/** @throws */
export const getSetSettingsForSet = async (set: Set): Promise<SetSettings | null> => getSetSettingsBySetId(set.id)

/** @throws */
export const getSetSettingsBySetId = async (setId: Set['id']): Promise<SetSettings | null> => {
  const client = await getClient()
  const result = await client.select()
    .from(SetSettings)
    .where(eq(SetSettings.set, setId))
  if (result.length === 0) {
    return null
  }
  return result[0]
}

export const getAllCardsForSet = async (set: Set): Promise<Card[]> => {
  const client = await getClient()
  return client.select()
    .from(Card)
    .where(eq(Card.set, set.id))
}

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
export const getAllCardVersionInvoicesForInvoice = async (invoice: Invoice): Promise<CardVersionHasInvoice[]> => {
  const client = await getClient()
  return await client.select()
    .from(CardVersionHasInvoice)
    .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
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
export const getAllCardVersionsWithdrawnByLnurlW = async (lnurlw: LnurlW): Promise<CardVersion[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(CardVersion)
    .where(eq(CardVersion.lnurlW, lnurlw.lnbitsId))
  return result
}

/** @throws */
export const getLnurlWById = async (id: string): Promise<LnurlW> => {
  const client = await getClient()
  const result = await client.select()
    .from(LnurlW)
    .where(eq(LnurlW.lnbitsId, id))
  if (result.length !== 1) {
    throw new NotFoundError(`Found no lnurlW for id ${id}`)
  }
  return result[0]
}

/** @throws */
export const getAllLnurlWs = async (): Promise<LnurlW[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(LnurlW)
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
export const insertSets = async (...sets: Set[]): Promise<void> => {
  const client = await getClient()
  await client.insert(Set)
    .values(sets)
}

/** @throws */
export const insertSetSettings = async (...setSettings: SetSettings[]): Promise<void> => {
  const client = await getClient()
  await client.insert(SetSettings)
    .values(setSettings)
}

/** @throws */
export const insertUsersCanUseSets = async (...usersCanUseSets: UserCanUseSet[]): Promise<void> => {
  const client = await getClient()
  await client.insert(UserCanUseSet)
    .values(usersCanUseSets)
}

/** @throws */
export const insertOrUpdateCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  await client.insert(Card)
    .values(card)
    .onDuplicateKeyUpdate({ set: card })
}

/** @throws */
export const insertOrUpdateLatestCardVersion = async (cardVersion: CardVersion): Promise<void> => {
  const latestCardVersion = await getLatestCardVersion(cardVersion.card)
  if (latestCardVersion != null) {
    return updateCardVersion({
      ...cardVersion,
      id: latestCardVersion.id,
    })
  } else {
    return insertCardVersions(cardVersion)
  }
}

/** @throws */
export const updateCardVersion = async (cardVersion: CardVersion): Promise<void> => {
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
export const insertOrUpdateSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  await client.insert(Set)
    .values(set)
    .onDuplicateKeyUpdate({ set: set })
}

/** @throws */
export const insertOrUpdateSetSettings = async (setSettings: SetSettings): Promise<void> => {
  const client = await getClient()
  await client.insert(SetSettings)
    .values(setSettings)
    .onDuplicateKeyUpdate({ set: setSettings })
}

/** @throws */
export const insertOrUpdateUserCanUseSet = async (userCanUseSet: UserCanUseSet): Promise<void> => {
  const client = await getClient()
  await client.insert(UserCanUseSet)
    .values(userCanUseSet)
    .onDuplicateKeyUpdate({ set: userCanUseSet })
}

/** @throws */
export const deleteCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  await client.delete(Card)
    .where(eq(Card.hash, card.hash))
}

/** @throws */
export const deleteCardVersion = async (cardVersion: CardVersion): Promise<void> => {
  const client = await getClient()
  await client.delete(CardVersion)
  .where(eq(CardVersion.id, cardVersion.id))
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

/** @throws */
export const getAllUsersThatCanUseSet = async (set: Set): Promise<UserCanUseSet[]> => {
  const client = await getClient()
  return await client.select()
    .from(UserCanUseSet)
    .where(eq(UserCanUseSet.set, set.id))
}

/** @throws */
export const getSetsByUserId = async (userId: string): Promise<Set[]> => {
  const client = await getClient()
  const result = await client.select()
    .from(Set)
    .innerJoin(UserCanUseSet, eq(Set.id, UserCanUseSet.set))
    .where(eq(UserCanUseSet.user, userId))
  return result.map(({ Set }) => Set)
}

/** @throws */
export const getLandingPage = async (landingPageId: string): Promise<LandingPage | null> => {
  const client = await getClient()
  const result = await client.select()
    .from(LandingPage)
    .where(eq(LandingPage.id, landingPageId))

  if (result.length === 0) {
    return null
  }

  return result[0]
}

export const getUserCanUseLandingPagesByLandingPageId = async (landingPage: LandingPage): Promise<UserCanUseLandingPage[]> => {
  const client = await getClient()
  return client.select()
    .from(UserCanUseLandingPage)
    .where(eq(LandingPage.id, landingPage.id))
}

export const getAllLandingPages = async (): Promise<LandingPage[]> => {
  const client = await getClient()
  return client.select()
    .from(LandingPage)
}
