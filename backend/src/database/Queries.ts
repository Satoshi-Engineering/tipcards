import { and, eq, isNull, desc, isNotNull, type ExtractTablesWithRelations, aliasedTable, sql } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'

import NotFoundError from '@backend/errors/NotFoundError.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
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
} from '@backend/database/schema/index.js'

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import('@backend/database/schema/index.js'),
  ExtractTablesWithRelations<typeof import('@backend/database/schema/index.js')>
>

export type SetWithSettings = Set & { settings: SetSettings }

export default class Queries {
  readonly transaction: Transaction

  constructor(transaction: Transaction) {
    this.transaction = transaction
  }

  /** @throws */
  async getSetById(setId: Set['id']): Promise<Set | null> {
    const result = await this.transaction.select()
      .from(Set)
      .where(eq(Set.id, setId))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  /** @throws */
  async getSetSettingsForSet(set: Set): Promise<SetSettings | null> {
    return this.getSetSettingsBySetId(set.id)
  }

  /** @throws */
  async getSetSettingsBySetId(setId: Set['id']): Promise<SetSettings | null> {
    const result = await this.transaction.select()
      .from(SetSettings)
      .where(eq(SetSettings.set, setId))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  /** @throws */
  async getAllCardsForSet(set: Set): Promise<Card[]> {
    return this.getAllCardsForSetBySetId(set.id)
  }

  /** @throws */
  async getAllCardsForSetBySetId(setId: Set['id']): Promise<Card[]> {
    return this.transaction.select()
      .from(Card)
      .where(eq(Card.set, setId))
  }

  /** @throws */
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

  /** @throws */
  async getLnurlPFundingCardVersion(cardVersion: CardVersion): Promise<LnurlP | null> {
    if (cardVersion.lnurlP == null) {
      return null
    }
    const result = await this.transaction.select()
      .from(LnurlP)
      .where(eq(LnurlP.lnbitsId, cardVersion.lnurlP))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  /** @throws */
  async getAllInvoicesFundingCardVersion(cardVersion: CardVersion): Promise<Invoice[]> {
    const result = await this.transaction.select()
      .from(CardVersionHasInvoice)
      .innerJoin(Invoice, eq(CardVersionHasInvoice.invoice, Invoice.paymentHash))
      .where(eq(CardVersionHasInvoice.cardVersion, cardVersion.id))
    return result.map(({ Invoice }) => Invoice)
  }

  /** @throws */
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

  /** @throws */
  async getInvoiceByPaymentHash(paymentHash: Invoice['paymentHash']): Promise<Invoice | null> {
    const result = await this.transaction.select()
      .from(Invoice)
      .where(eq(Invoice.paymentHash, paymentHash))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  /** @throws */
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

  /** @throws */
  async getAllCardVersionsFundedByInvoice(invoice: Invoice): Promise<CardVersion[]> {
    const result = await this.transaction.select()
      .from(CardVersionHasInvoice)
      .innerJoin(CardVersion, eq(CardVersionHasInvoice.cardVersion, CardVersion.id))
      .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
    return result.map(({ CardVersion }) => CardVersion)
  }

  /** @throws */
  getAllCardVersionInvoicesForInvoice(invoice: Invoice): Promise<CardVersionHasInvoice[]> {
    return this.transaction.select()
      .from(CardVersionHasInvoice)
      .where(eq(CardVersionHasInvoice.invoice, invoice.paymentHash))
  }

  /** @throws */
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
    if (result.length > 1) {
      throw new Error(`More than one withdraw exists for card ${cardVersion.card}`)
    }
    return result[0]
  }

  /** @throws */
  async getAllCardVersionsWithdrawnByLnurlW(lnurlw: LnurlW): Promise<CardVersion[]> {
    const result = await this.transaction.select()
      .from(CardVersion)
      .where(eq(CardVersion.lnurlW, lnurlw.lnbitsId))
    return result
  }

  /** @throws */
  async getLnurlWById(id: LnurlW['lnbitsId']): Promise<LnurlW> {
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(eq(LnurlW.lnbitsId, id))
    if (result.length !== 1) {
      throw new NotFoundError(`Found no lnurlW for id ${id}`)
    }
    return result[0]
  }

  /** @throws */
  async getLnurlWByBulkWithdrawId(bulkWithdrawId: LnurlW['bulkWithdrawId']): Promise<LnurlW | null> {
    if (bulkWithdrawId == null) {
      throw new NotFoundError('Unable to load lnurlw if bulkWithdrawId is null')
    }
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(eq(LnurlW.bulkWithdrawId, bulkWithdrawId))
    if (result.length !== 1) {
      throw new NotFoundError(`Found no lnurlW for bulkWithdrawId ${bulkWithdrawId}`)
    }
    return result[0]
  }

  /** @throws */
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

  /** @throws */
  async getAllLnurlWs(): Promise<LnurlW[]> {
    const result = await this.transaction.select()
      .from(LnurlW)
    return result
  }

  /** @throws */
  async getAllLnurlWsWithBulkWithdrawId(): Promise<LnurlW[]> {
    const result = await this.transaction.select()
      .from(LnurlW)
      .where(isNotNull(LnurlW.bulkWithdrawId))
    return result
  }

  /** @throws */
  async insertCards(...cards: Card[]): Promise<void> {
    await this.transaction.insert(Card)
      .values(cards)
  }

  /** @throws */
  async getCardByHash(hash: Card['hash']): Promise<Card | null> {
    const result = await this.transaction.select()
      .from(Card)
      .where(eq(Card.hash, hash))
    if (result.length === 0) {
      return null
    }
    return result[0]
  }

  /** @throws */
  async setCardLock(hash: Card['hash'], locked: string): Promise<void> {
    await this.transaction.update(Card)
      .set({ locked })
      .where(and(
        eq(Card.hash, hash),
        isNull(Card.locked),
      ))
  }

  /** @throws */
  async releaseCardLock(hash: Card['hash'], locked: string): Promise<void> {
    await this.transaction.update(Card)
      .set({ locked: null })
      .where(and(
        eq(Card.hash, hash),
        eq(Card.locked, locked),
      ))
  }

  /** @throws */
  async insertCardVersions(...cardVersions: CardVersion[]): Promise<void> {
    await this.transaction.insert(CardVersion)
      .values(cardVersions)
  }

  /** @throws */
  async insertInvoices(...invoices: Invoice[]): Promise<void> {
    await this.transaction.insert(Invoice)
      .values(invoices)
  }

  /** @throws */
  async insertCardVersionInvoices(...cardVersionInvoices: CardVersionHasInvoice[]): Promise<void> {
    await this.transaction.insert(CardVersionHasInvoice)
      .values(cardVersionInvoices)
  }

  /** @throws */
  async insertLnurlPs(...lnurlps: LnurlP[]): Promise<void> {
    await this.transaction.insert(LnurlP)
      .values(lnurlps)
  }

  /** @throws */
  async insertLnurlWs(...lnurlws: LnurlW[]): Promise<void> {
    await this.transaction.insert(LnurlW)
      .values(lnurlws)
  }

  /** @throws */
  async insertSets(...sets: Set[]): Promise<void> {
    await this.transaction.insert(Set)
      .values(sets)
  }

  /** @throws */
  async insertSetSettings(...setSettings: SetSettings[]): Promise<void> {
    await this.transaction.insert(SetSettings)
      .values(setSettings)
  }

  /** @throws */
  async insertUsersCanUseSets(...usersCanUseSets: UserCanUseSet[]): Promise<void> {
    await this.transaction.insert(UserCanUseSet)
      .values(usersCanUseSets)
  }

  /** @throws */
  async insertOrUpdateCard(card: Card): Promise<void> {
    await this.transaction.insert(Card)
      .values(card)
      .onConflictDoUpdate({
        target: Card.hash,
        set: card ,
      })
  }

  /** @throws */
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

  /** @throws */
  async insertOrUpdateInvoice(invoice: Invoice): Promise<void> {
    await this.transaction.insert(Invoice)
      .values(invoice)
      .onConflictDoUpdate({
        target: Invoice.paymentHash,
        set: invoice,
      })
  }

  /** @throws */
  async updateInvoice(invoice: Invoice): Promise<void> {
    await this.transaction.update(Invoice)
      .set(invoice)
      .where(eq(Invoice.paymentHash, invoice.paymentHash))
  }

  /** @throws */
  async insertOrUpdateCardVersionInvoice(cardVersionInvoice: CardVersionHasInvoice): Promise<void> {
    await this.transaction.insert(CardVersionHasInvoice)
      .values(cardVersionInvoice)
      .onConflictDoUpdate({
        target: [CardVersionHasInvoice.cardVersion, CardVersionHasInvoice.invoice],
        set: cardVersionInvoice,
      })
  }

  /** @throws */
  async insertOrUpdateLnurlP(lnurlp: LnurlP): Promise<void> {
    await this.transaction.insert(LnurlP)
      .values(lnurlp)
      .onConflictDoUpdate({
        target: LnurlP.lnbitsId,
        set: lnurlp,
      })
  }

  /** @throws */
  async insertOrUpdateLnurlW(lnurlw: LnurlW): Promise<void> {
    await this.transaction.insert(LnurlW)
      .values(lnurlw)
      .onConflictDoUpdate({
        target: LnurlW.lnbitsId,
        set: lnurlw,
      })
  }

  /** @throws */
  async updateLnurlW(lnurlw: LnurlW): Promise<void> {
    await this.transaction.update(LnurlW)
      .set(lnurlw)
      .where(eq(LnurlW.lnbitsId, lnurlw.lnbitsId))
  }

  /** @throws */
  async insertOrUpdateSet(set: Set): Promise<void> {
    await this.transaction.insert(Set)
      .values(set)
      .onConflictDoUpdate({
        target: Set.id,
        set: set,
      })
  }

  /** @throws */
  async updateSet(set: Set): Promise<void> {
    await this.transaction.update(Set)
      .set(set)
      .where(eq(Set.id, set.id))
  }

  /** @throws */
  async insertOrUpdateSetSettings(setSettings: SetSettings): Promise<void> {
    await this.transaction.insert(SetSettings)
      .values(setSettings)
      .onConflictDoUpdate({
        target: SetSettings.set,
        set: setSettings,
      })
  }

  /** @throws */
  async insertOrUpdateUser(user: User): Promise<void> {
    await this.transaction.insert(User)
      .values(user)
      .onConflictDoUpdate({
        target: User.id,
        set: user,
      })
  }

  /** @throws */
  async insertOrUpdateUserCanUseSet(userCanUseSet: UserCanUseSet): Promise<void> {
    await this.transaction.insert(UserCanUseSet)
      .values(userCanUseSet)
      .onConflictDoUpdate({
        target: [UserCanUseSet.user, UserCanUseSet.set],
        set: userCanUseSet,
      })
  }

  /** @throws */
  async updateCard(card: Card): Promise<void> {
    await this.transaction.update(Card)
      .set({
        created: card.created,
        set: card.set,
      })
      .where(eq(Card.hash, card.hash))
  }

  /** @throws */
  async updateCardVersion(cardVersion: CardVersion): Promise<void> {
    await this.transaction.update(CardVersion)
      .set(cardVersion)
      .where(eq(CardVersion.id, cardVersion.id))
  }

  /** @throws */
  async deleteCard(card: Card): Promise<void> {
    await this.transaction.delete(Card)
      .where(eq(Card.hash, card.hash))
  }

  /** @throws */
  async deleteCardVersion(cardVersion: CardVersion): Promise<void> {
    await this.transaction.delete(CardVersion)
      .where(eq(CardVersion.id, cardVersion.id))
  }

  /** @throws */
  async deleteInvoice(invoice: Invoice): Promise<void> {
    await this.transaction.delete(Invoice)
      .where(eq(Invoice.paymentHash, invoice.paymentHash))
  }

  /** @throws */
  async deleteCardVersionInvoice(cardVersionInvoice: CardVersionHasInvoice): Promise<void> {
    await this.transaction.delete(CardVersionHasInvoice)
      .where(and(
        eq(CardVersionHasInvoice.invoice, cardVersionInvoice.invoice),
        eq(CardVersionHasInvoice.cardVersion, cardVersionInvoice.cardVersion),
      ))
  }

  /** @throws */
  async deleteLnurlWByBulkWithdrawId(bulkWithdrawId: string): Promise<void> {
    await this.transaction.delete(LnurlW)
      .where(eq(LnurlW.bulkWithdrawId, bulkWithdrawId))
  }

  /** @throws */
  async getAllUsersThatCanUseSet(set: Set): Promise<UserCanUseSet[]> {
    return this.getAllUsersThatCanUseSetBySetId(set.id)
  }

  /** @throws */
  getAllUsersThatCanUseSetBySetId(setId: Set['id']): Promise<UserCanUseSet[]> {
    return this.transaction.select()
      .from(UserCanUseSet)
      .where(eq(UserCanUseSet.set, setId))
  }

  /** @throws */
  async getSetsByUserId(userId: User['id']): Promise<Set[]> {
    const result = await this.transaction.select()
      .from(Set)
      .innerJoin(UserCanUseSet, eq(Set.id, UserCanUseSet.set))
      .where(eq(UserCanUseSet.user, userId))
    return result.map(({ Set }) => Set)
  }

  /** @throws */
  async getSetsWithSettingsByUserId(userId: User['id']): Promise<SetWithSettings[]> {
    const result = await this.transaction.select()
      .from(Set)
      .innerJoin(UserCanUseSet, eq(Set.id, UserCanUseSet.set))
      .innerJoin(SetSettings, eq(Set.id, SetSettings.set))
      .where(eq(UserCanUseSet.user, userId))
    return result.map(({ Set, SetSettings }) => ({
      ...Set,
      settings: SetSettings,
    }))
  }

  /** @throws */
  async getLandingPage(landingPageId: LandingPage['id']): Promise<LandingPage | null> {
    const result = await this.transaction.select()
      .from(LandingPage)
      .where(eq(LandingPage.id, landingPageId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  /** @throws */
  getUserCanUseLandingPagesByLandingPage(landingPage: LandingPage): Promise<UserCanUseLandingPage[]> {
    return this.transaction.select()
      .from(UserCanUseLandingPage)
      .where(eq(UserCanUseLandingPage.landingPage, landingPage.id))
  }

  /** @throws */
  getAllLandingPages(): Promise<LandingPage[]> {
    return this.transaction.select()
      .from(LandingPage)
  }

  /** @throws */
  async getAllUserCanUseLandingPagesForUser(user: User): Promise<UserCanUseLandingPage[]> {
    return this.getAllUserCanUseLandingPagesForUserId(user.id)
  }

  /** @throws */
  getAllUserCanUseLandingPagesForUserId(userId: User['id']): Promise<UserCanUseLandingPage[]> {
    return this.transaction.select()
      .from(UserCanUseLandingPage)
      .where(eq(UserCanUseLandingPage.user, userId))
  }

  /** @throws */
  async deleteSet(set: Set): Promise<void> {
    await this.transaction.delete(Set)
      .where(eq(Set.id, set.id))
  }

  /** @throws */
  async deleteSetSettings(setSettings: SetSettings): Promise<void> {
    await this.transaction.delete(SetSettings)
      .where(eq(SetSettings.set, setSettings.set))
  }

  /** @throws */
  async deleteUserCanUseSet(userCanUseSet: UserCanUseSet): Promise<void> {
    await this.transaction.delete(UserCanUseSet)
      .where(and(
        eq(UserCanUseSet.user, userCanUseSet.user),
        eq(UserCanUseSet.set, userCanUseSet.set),
      ))
  }

  /** @throws */
  async getImageById(id: Image['id']): Promise<Image> {
    const result = await this.transaction.select()
      .from(Image)
      .where(eq(Image.id, id))
    return result[0]
  }

  /** @throws */
  async getAllUsersThatCanUseImage(image: Image): Promise<UserCanUseImage[]> {
    return this.getAllUsersThatCanUseImageByImageId(image.id)
  }

  /** @throws */
  getAllUsersThatCanUseImageByImageId(imageId: Image['id']): Promise<UserCanUseImage[]> {
    return this.transaction.select()
      .from(UserCanUseImage)
      .where(eq(UserCanUseImage.image, imageId))
  }

  /** @throws */
  async getAllUserCanUseImagesForUser(user: User): Promise<UserCanUseImage[]> {
    return this.getAllUserCanUseImagesForUserId(user.id)
  }

  /** @throws */
  getAllUserCanUseImagesForUserId(userId: User['id']): Promise<UserCanUseImage[]> {
    return this.transaction.select()
      .from(UserCanUseImage)
      .where(eq(UserCanUseImage.user, userId))
  }

  /** @throws */
  async getUserById(userId: User['id']): Promise<User | null> {
    const result = await this.transaction.select()
      .from(User)
      .where(eq(User.id, userId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  /** @throws */
  async getUserByLnurlAuthKey(lnurlAuthKey: User['lnurlAuthKey']): Promise<User | null> {
    const result = await this.transaction.select()
      .from(User)
      .where(eq(User.lnurlAuthKey, lnurlAuthKey))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  /** @throws */
  getAllUsers(): Promise<User[]> {
    return this.transaction.select()
      .from(User)
  }

  /** @throws */
  async getProfileByUserId(userId: User['id']): Promise<Profile | null> {
    const result = await this.transaction.select()
      .from(Profile)
      .where(eq(Profile.user, userId))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  /** @throws */
  async insertOrUpdateProfile(profile: Profile): Promise<void> {
    await this.transaction.insert(Profile)
      .values(profile)
      .onConflictDoUpdate({
        target: Profile.user,
        set: profile,
      })
  }

  /** @throws */
  getAllAllowedRefreshTokensForUser(user: User): Promise<AllowedRefreshTokens[]> {
    return this.getAllAllowedRefreshTokensForUserId(user.id)
  }

  /** @throws */
  async getAllAllowedRefreshTokensForUserId(userId: User['id']): Promise<AllowedRefreshTokens[]> {
    return this.transaction.select()
      .from(AllowedRefreshTokens)
      .where(eq(AllowedRefreshTokens.user, userId))
  }

  /** @throws */
  async insertOrUpdateAllowedRefreshTokens(allowedRefreshTokens: AllowedRefreshTokens): Promise<void> {
    await this.transaction.insert(AllowedRefreshTokens)
      .values(allowedRefreshTokens)
      .onConflictDoUpdate({
        target: AllowedRefreshTokens.hash,
        set: allowedRefreshTokens,
      })
  }

  /** @throws */
  async deleteAllAllowedRefreshTokensForUserId(userId: User['id']): Promise<void> {
    await this.transaction.delete(AllowedRefreshTokens)
      .where(eq(AllowedRefreshTokens.user, userId))
  }
}
