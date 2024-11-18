import { and, eq, isNull, desc, isNotNull, type ExtractTablesWithRelations, aliasedTable, sql, ne, asc } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import type { SetWithSettings } from '@backend/database/data/SetWithSettings.js'
import {
  Set, SetSettings,
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  Image, UserCanUseImage,
  User, Profile,
  AllowedRefreshTokens,
  UserCanUseSet,
  LandingPage, UserCanUseLandingPage,
  AllowedSession,
} from '@backend/database/schema/index.js'
import assert from 'node:assert'

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import('@backend/database/schema/index.js'),
  ExtractTablesWithRelations<typeof import('@backend/database/schema/index.js')>
>

export type SetCollectionOptions = {
  sorting: 'changed' | 'alphabetical' | 'created',
  sortingDirection: 'ASC' | 'DESC',
  limit?: number,
}

/**
 * As all methods in this class are database queries they are async and can throw errors.
 */
export default class Queries {
  readonly transaction: Transaction

  constructor(transaction: Transaction) {
    this.transaction = transaction
  }

  async getSetById(setId: Set['id']): Promise<Set | null> {
    const result = await this.transaction.select()
      .from(Set)
      .where(eq(Set.id, setId))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async getSetSettingsForSet(set: Set): Promise<SetSettings | null> {
    return this.getSetSettingsBySetId(set.id)
  }

  async getSetSettingsBySetId(setId: Set['id']): Promise<SetSettings | null> {
    const result = await this.transaction.select()
      .from(SetSettings)
      .where(eq(SetSettings.set, setId))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async getAllCardsForSet(set: Set): Promise<Card[]> {
    return this.getAllCardsForSetBySetId(set.id)
  }

  async getAllCardsForSetBySetId(setId: Set['id']): Promise<Card[]> {
    return this.transaction.select()
      .from(Card)
      .where(eq(Card.set, setId))
  }

  async getLatestCardVersion(cardHash: Card['hash']): Promise<CardVersion | null> {
    const result = await this.transaction.select()
      .from(CardVersion)
      .orderBy(desc(CardVersion.created))
      .where(eq(CardVersion.card, cardHash))
      .limit(1)
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async getLnurlPFundingCardVersion(cardVersion: CardVersion): Promise<LnurlP | null> {
    if (cardVersion.lnurlP == null) {
      return null
    }
    return this.getLnurlPById(cardVersion.lnurlP)
  }

  async getLnurlPById(id: LnurlP['lnbitsId']): Promise<LnurlP | null> {
    const result = await this.transaction.select()
      .from(LnurlP)
      .where(eq(LnurlP.lnbitsId, id))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async getAllInvoicesFundingCardVersion(cardVersion: CardVersion): Promise<Invoice[]> {
    const result = await this.transaction.select()
      .from(CardVersionHasInvoice)
      .innerJoin(Invoice, eq(CardVersionHasInvoice.invoice, Invoice.paymentHash))
      .where(eq(CardVersionHasInvoice.cardVersion, cardVersion.id))
    return result.map(({ Invoice }) => Invoice)
  }

  async getAllInvoicesFundingCardVersionWithSetFundingInfo(cardVersion: CardVersion): Promise<InvoiceWithSetFundingInfo[]> {
    const cardsFundedBySingleInvoice = aliasedTable(CardVersionHasInvoice, 'cardsFundedBySingleInvoice')
    const result = await this.transaction.select({
      amount: Invoice.amount,
      paymentHash: Invoice.paymentHash,
      paymentRequest: Invoice.paymentRequest,
      created: Invoice.created,
      paid: Invoice.paid,
      expiresAt: Invoice.expiresAt,
      extra: Invoice.extra,
      cardCount: sql<number>`cast(count(${cardsFundedBySingleInvoice.cardVersion}) as int)`,
    })
      .from(CardVersionHasInvoice)
      .innerJoin(Invoice, eq(CardVersionHasInvoice.invoice, Invoice.paymentHash))
      .leftJoin(cardsFundedBySingleInvoice, eq(Invoice.paymentHash, cardsFundedBySingleInvoice.invoice))
      .where(eq(CardVersionHasInvoice.cardVersion, cardVersion.id))
      .groupBy(Invoice.paymentHash)
    return result.map(({
      amount,
      paymentHash,
      paymentRequest,
      created,
      paid,
      expiresAt,
      extra,
      cardCount,
    }) => new InvoiceWithSetFundingInfo(
      {
        amount,
        paymentHash,
        paymentRequest,
        created,
        paid,
        expiresAt,
        extra,
      },
      cardCount,
    ))
  }

  async getInvoiceByPaymentHash(paymentHash: Invoice['paymentHash']): Promise<Invoice | null> {
    const result = await this.transaction.select()
      .from(Invoice)
      .where(eq(Invoice.paymentHash, paymentHash))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async getUnpaidInvoicesForCardVersion(cardVersion: CardVersion): Promise<Invoice[]> {
    const result = await this.transaction.select()
      .from(Invoice)
      .innerJoin(CardVersionHasInvoice, eq(Invoice.paymentHash, CardVersionHasInvoice.invoice))
      .where(and(
        eq(CardVersionHasInvoice.cardVersion, cardVersion.id),
        isNull(Invoice.paid),
      ))
    return result.map(({ Invoice }) => Invoice)
  }

  async getAllCardVersionsFundedByInvoice(invoice: Invoice): Promise<CardVersion[]> {
    const result = await this.transaction.select()
      .from(CardVersionHasInvoice)
      .innerJoin(CardVersion, eq(CardVersionHasInvoice.cardVersion, CardVersion.id))
      .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
    return result.map(({ CardVersion }) => CardVersion)
  }

  getAllCardVersionInvoicesForInvoice(invoice: Invoice): Promise<CardVersionHasInvoice[]> {
    return this.transaction.select()
      .from(CardVersionHasInvoice)
      .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
  }

  async getLnurlWWithdrawingCardVersion(cardVersion: CardVersion): Promise<LnurlW | null> {
    if (cardVersion.lnurlW == null) {
      return null
    }
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(eq(LnurlW.lnbitsId, cardVersion.lnurlW))
    if (result.length === 0) {
      return null
    }
    assert(result.length === 1, `Primary key violation. More than one withdraw exists for card ${cardVersion.card}`)
    return result[0]
  }

  async getAllCardVersionsWithdrawnByLnurlW(lnurlw: LnurlW): Promise<CardVersion[]> {
    const result = await this.transaction.select()
      .from(CardVersion)
      .where(eq(CardVersion.lnurlW, lnurlw.lnbitsId))
    return result
  }

  async getLnurlWById(id: LnurlW['lnbitsId']): Promise<LnurlW | null> {
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(eq(LnurlW.lnbitsId, id))
    if (result.length !== 1) {
      return null
    }
    return result[0]
  }

  async getLnurlWByBulkWithdrawId(bulkWithdrawId: LnurlW['bulkWithdrawId']): Promise<LnurlW | null> {
    if (bulkWithdrawId == null) {
      throw new Error('Unable to load lnurlW if bulkWithdrawId is null')
    }
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(eq(LnurlW.bulkWithdrawId, bulkWithdrawId))
    if (result.length !== 1) {
      return null
    }
    return result[0]
  }

  async getLnurlWByCardHash(cardHash: Card['hash']): Promise<LnurlW | null> {
    const latestCardVersion = await this.getLatestCardVersion(cardHash)
    if (latestCardVersion?.lnurlW == null) {
      return null
    }
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(eq(LnurlW.lnbitsId, latestCardVersion.lnurlW))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async getAllLnurlWs(): Promise<LnurlW[]> {
    const result = await this.transaction.select()
      .from(LnurlW)
    return result
  }

  async getAllLnurlWsWithBulkWithdrawId(): Promise<LnurlW[]> {
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(isNotNull(LnurlW.bulkWithdrawId))
    return result
  }

  async insertCards(...cards: Card[]): Promise<void> {
    await this.transaction.insert(Card)
      .values(cards)
  }

  async getCardByHash(hash: Card['hash']): Promise<Card | null> {
    const result = await this.transaction.select()
      .from(Card)
      .where(eq(Card.hash, hash))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  async insertCardVersions(...cardVersions: CardVersion[]): Promise<void> {
    await this.transaction.insert(CardVersion)
      .values(cardVersions)
  }

  async insertInvoices(...invoices: Invoice[]): Promise<void> {
    await this.transaction.insert(Invoice)
      .values(invoices)
  }

  async insertCardVersionInvoices(...cardVersionInvoices: CardVersionHasInvoice[]): Promise<void> {
    await this.transaction.insert(CardVersionHasInvoice)
      .values(cardVersionInvoices)
  }

  async insertLnurlPs(...lnurlps: LnurlP[]): Promise<void> {
    await this.transaction.insert(LnurlP)
      .values(lnurlps)
  }

  async insertLnurlWs(...lnurlws: LnurlW[]): Promise<void> {
    await this.transaction.insert(LnurlW)
      .values(lnurlws)
  }

  async insertSets(...sets: Set[]): Promise<void> {
    await this.transaction.insert(Set)
      .values(sets)
  }

  async insertSetSettings(...setSettings: SetSettings[]): Promise<void> {
    await this.transaction.insert(SetSettings)
      .values(setSettings)
  }

  async insertUsersCanUseSets(...usersCanUseSets: UserCanUseSet[]): Promise<void> {
    await this.transaction.insert(UserCanUseSet)
      .values(usersCanUseSets)
  }

  async insertOrUpdateCard(card: Card): Promise<void> {
    await this.transaction.insert(Card)
      .values(card)
      .onConflictDoUpdate({
        target: Card.hash,
        set: card ,
      })
  }

  async insertOrUpdateLatestCardVersion(cardVersion: CardVersion): Promise<void> {
    const latestCardVersion = await this.getLatestCardVersion(cardVersion.card)
    if (latestCardVersion != null) {
      return this.updateCardVersion({
        ...cardVersion,
        id: latestCardVersion.id,
      })
    } else {
      return this.insertCardVersions(cardVersion)
    }
  }

  async insertOrUpdateInvoice(invoice: Invoice): Promise<void> {
    await this.transaction.insert(Invoice)
      .values(invoice)
      .onConflictDoUpdate({
        target: Invoice.paymentHash,
        set: invoice,
      })
  }

  async updateInvoice(invoice: Invoice): Promise<void> {
    await this.transaction.update(Invoice)
      .set(invoice)
      .where(eq(Invoice.paymentHash, invoice.paymentHash))
  }

  async insertOrUpdateCardVersionInvoice(cardVersionInvoice: CardVersionHasInvoice): Promise<void> {
    await this.transaction.insert(CardVersionHasInvoice)
      .values(cardVersionInvoice)
      .onConflictDoUpdate({
        target: [CardVersionHasInvoice.cardVersion, CardVersionHasInvoice.invoice],
        set: cardVersionInvoice,
      })
  }

  async insertOrUpdateLnurlP(lnurlp: LnurlP): Promise<void> {
    await this.transaction.insert(LnurlP)
      .values(lnurlp)
      .onConflictDoUpdate({
        target: LnurlP.lnbitsId,
        set: lnurlp,
      })
  }

  async insertOrUpdateLnurlW(lnurlw: LnurlW): Promise<void> {
    await this.transaction.insert(LnurlW)
      .values(lnurlw)
      .onConflictDoUpdate({
        target: LnurlW.lnbitsId,
        set: lnurlw,
      })
  }

  async updateLnurlW(lnurlw: LnurlW): Promise<void> {
    await this.transaction.update(LnurlW)
      .set(lnurlw)
      .where(eq(LnurlW.lnbitsId, lnurlw.lnbitsId))
  }

  async insertOrUpdateSet(set: Set): Promise<void> {
    await this.transaction.insert(Set)
      .values(set)
      .onConflictDoUpdate({
        target: Set.id,
        set: set,
      })
  }

  async updateSet(set: Set): Promise<void> {
    await this.transaction.update(Set)
      .set(set)
      .where(eq(Set.id, set.id))
  }

  async insertOrUpdateSetSettings(setSettings: SetSettings): Promise<void> {
    await this.transaction.insert(SetSettings)
      .values(setSettings)
      .onConflictDoUpdate({
        target: SetSettings.set,
        set: setSettings,
      })
  }

  /**
   * @deprecated as it is only used by batchQueries.ts with is still used by deprecated (redis) queries
   */
  async insertOrUpdateUser(user: User): Promise<void> {
    await this.transaction.insert(User)
      .values(user)
      .onConflictDoUpdate({
        target: User.id,
        set: user,
      })
  }

  async insertUser(user: User): Promise<void> {
    await this.transaction.insert(User)
      .values(user)
  }

  async insertOrUpdateUserCanUseSet(userCanUseSet: UserCanUseSet): Promise<void> {
    await this.transaction.insert(UserCanUseSet)
      .values(userCanUseSet)
      .onConflictDoUpdate({
        target: [UserCanUseSet.user, UserCanUseSet.set],
        set: userCanUseSet,
      })
  }

  async updateCard(card: Card): Promise<void> {
    await this.transaction.update(Card)
      .set({
        created: card.created,
        set: card.set,
      })
      .where(eq(Card.hash, card.hash))
  }

  async updateCardVersion(cardVersion: CardVersion): Promise<void> {
    await this.transaction.update(CardVersion)
      .set(cardVersion)
      .where(eq(CardVersion.id, cardVersion.id))
  }

  async deleteCard(card: Card): Promise<void> {
    await this.transaction.delete(Card)
      .where(eq(Card.hash, card.hash))
  }

  async deleteCardVersion(cardVersion: CardVersion): Promise<void> {
    await this.transaction.delete(CardVersion)
      .where(eq(CardVersion.id, cardVersion.id))
  }

  async deleteInvoice(invoice: Invoice): Promise<void> {
    await this.transaction.delete(Invoice)
      .where(eq(Invoice.paymentHash, invoice.paymentHash))
  }

  async deleteCardVersionInvoice(cardVersionInvoice: CardVersionHasInvoice): Promise<void> {
    await this.transaction.delete(CardVersionHasInvoice)
      .where(and(
        eq(CardVersionHasInvoice.invoice, cardVersionInvoice.invoice),
        eq(CardVersionHasInvoice.cardVersion, cardVersionInvoice.cardVersion),
      ))
  }

  async deleteLnurlWByBulkWithdrawId(bulkWithdrawId: string): Promise<void> {
    await this.transaction.delete(LnurlW)
      .where(eq(LnurlW.bulkWithdrawId, bulkWithdrawId))
  }

  async getAllUsersThatCanUseSet(set: Set): Promise<UserCanUseSet[]> {
    return this.getAllUsersThatCanUseSetBySetId(set.id)
  }

  getAllUsersThatCanUseSetBySetId(setId: Set['id']): Promise<UserCanUseSet[]> {
    return this.transaction.select()
      .from(UserCanUseSet)
      .where(eq(UserCanUseSet.set, setId))
  }

  async getSetsByUserId(userId: User['id']): Promise<Set[]> {
    const result = await this.transaction.select()
      .from(Set)
      .innerJoin(UserCanUseSet, eq(Set.id, UserCanUseSet.set))
      .where(eq(UserCanUseSet.user, userId))
    return result.map(({ Set }) => Set)
  }

  async getSetsWithSettingsByUserId(userId: User['id'], { sorting, sortingDirection, limit = undefined }: SetCollectionOptions): Promise<SetWithSettings[]> {
    const orderBy = (() => {
      switch (sorting) {
        case 'changed':
          return Set.changed
        case 'alphabetical':
          return SetSettings.name
        case 'created':
          return Set.created
      }
    })()
    const orderDirection = (() => {
      switch (sortingDirection) {
        case 'ASC':
          return asc
        case 'DESC':
          return desc
      }
    })()
    const result = await this.transaction.select()
      .from(Set)
      .innerJoin(UserCanUseSet, eq(Set.id, UserCanUseSet.set))
      .innerJoin(SetSettings, eq(Set.id, SetSettings.set))
      .where(eq(UserCanUseSet.user, userId))
      .orderBy(orderDirection(orderBy))
      .limit(limit ?? -1)
    return result.map(({ Set, SetSettings }) => ({
      ...Set,
      settings: SetSettings,
    }))
  }

  async getLandingPage(landingPageId: LandingPage['id']): Promise<LandingPage | null> {
    const result = await this.transaction.select()
      .from(LandingPage)
      .where(eq(LandingPage.id, landingPageId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  getUserCanUseLandingPagesByLandingPage(landingPage: LandingPage): Promise<UserCanUseLandingPage[]> {
    return this.transaction.select()
      .from(UserCanUseLandingPage)
      .where(eq(UserCanUseLandingPage.landingPage, landingPage.id))
  }

  getAllLandingPages(): Promise<LandingPage[]> {
    return this.transaction.select()
      .from(LandingPage)
  }

  async getAllUserCanUseLandingPagesForUser(user: User): Promise<UserCanUseLandingPage[]> {
    return this.getAllUserCanUseLandingPagesForUserId(user.id)
  }

  getAllUserCanUseLandingPagesForUserId(userId: User['id']): Promise<UserCanUseLandingPage[]> {
    return this.transaction.select()
      .from(UserCanUseLandingPage)
      .where(eq(UserCanUseLandingPage.user, userId))
  }

  async deleteSet(set: Set): Promise<void> {
    await this.transaction.delete(Set)
      .where(eq(Set.id, set.id))
  }

  async deleteSetSettings(setSettings: SetSettings): Promise<void> {
    await this.transaction.delete(SetSettings)
      .where(eq(SetSettings.set, setSettings.set))
  }

  async deleteUserCanUseSet(userCanUseSet: UserCanUseSet): Promise<void> {
    await this.transaction.delete(UserCanUseSet)
      .where(and(
        eq(UserCanUseSet.user, userCanUseSet.user),
        eq(UserCanUseSet.set, userCanUseSet.set),
      ))
  }

  async getImageById(id: Image['id']): Promise<Image> {
    const result = await this.transaction.select()
      .from(Image)
      .where(eq(Image.id, id))
    return result[0]
  }

  async getAllUsersThatCanUseImage(image: Image): Promise<UserCanUseImage[]> {
    return this.getAllUsersThatCanUseImageByImageId(image.id)
  }

  getAllUsersThatCanUseImageByImageId(imageId: Image['id']): Promise<UserCanUseImage[]> {
    return this.transaction.select()
      .from(UserCanUseImage)
      .where(eq(UserCanUseImage.image, imageId))
  }

  async getAllUserCanUseImagesForUser(user: User): Promise<UserCanUseImage[]> {
    return this.getAllUserCanUseImagesForUserId(user.id)
  }

  getAllUserCanUseImagesForUserId(userId: User['id']): Promise<UserCanUseImage[]> {
    return this.transaction.select()
      .from(UserCanUseImage)
      .where(eq(UserCanUseImage.user, userId))
  }

  async getUserById(userId: User['id']): Promise<User | null> {
    const result = await this.transaction.select()
      .from(User)
      .where(eq(User.id, userId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  async getUserByLnurlAuthKey(lnurlAuthKey: User['lnurlAuthKey']): Promise<User | null> {
    const result = await this.transaction.select()
      .from(User)
      .where(eq(User.lnurlAuthKey, lnurlAuthKey))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  getAllUsers(): Promise<User[]> {
    return this.transaction.select()
      .from(User)
  }

  async getProfileByUserId(userId: User['id']): Promise<Profile | null> {
    const result = await this.transaction.select()
      .from(Profile)
      .where(eq(Profile.user, userId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  async insertOrUpdateProfile(profile: Profile): Promise<void> {
    await this.transaction.insert(Profile)
      .values(profile)
      .onConflictDoUpdate({
        target: Profile.user,
        set: profile,
      })
  }

  getAllAllowedRefreshTokensForUser(user: User): Promise<AllowedRefreshTokens[]> {
    return this.getAllAllowedRefreshTokensForUserId(user.id)
  }

  async getAllAllowedRefreshTokensForUserId(userId: User['id']): Promise<AllowedRefreshTokens[]> {
    return this.transaction.select()
      .from(AllowedRefreshTokens)
      .where(eq(AllowedRefreshTokens.user, userId))
  }

  async insertOrUpdateAllowedRefreshTokens(allowedRefreshTokens: AllowedRefreshTokens): Promise<void> {
    await this.transaction.insert(AllowedRefreshTokens)
      .values(allowedRefreshTokens)
      .onConflictDoUpdate({
        target: AllowedRefreshTokens.hash,
        set: allowedRefreshTokens,
      })
  }

  async deleteAllAllowedRefreshTokensForUserId(userId: User['id']): Promise<void> {
    await this.transaction.delete(AllowedRefreshTokens)
      .where(eq(AllowedRefreshTokens.user, userId))
  }

  async insertAllowedSession(allowedSession: AllowedSession): Promise<void> {
    await this.transaction.insert(AllowedSession)
      .values(allowedSession)
  }

  async getAllowedSessionById(sessionId: AllowedSession['sessionId']): Promise<AllowedSession | null> {
    const result = await this.transaction.select()
      .from(AllowedSession)
      .where(eq(AllowedSession.sessionId, sessionId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  async deleteAllowedSession(allowedSession: AllowedSession): Promise<void> {
    await this.transaction.delete(AllowedSession)
      .where(eq(AllowedSession.sessionId, allowedSession.sessionId))
  }

  async deleteAllAllowedSessionForUserExceptOne(userId: User['id'], sessionId: AllowedSession['sessionId']): Promise<void> {
    await this.transaction.delete(AllowedSession)
      .where(and(eq(AllowedSession.user, userId), ne(AllowedSession.sessionId, sessionId)))
  }
}
