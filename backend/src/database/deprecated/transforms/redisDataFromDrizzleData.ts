import type {
  User,
  CardVersion,
  Invoice,
  LandingPage,
  Profile,
} from '@backend/database/schema/index.js'
import type Queries from '@backend/database/Queries.js'
import { LandingPageType } from '@backend/database/schema/enums/LandingPageType.js'
import { Card as CardRedis } from '@backend/database/deprecated/data/Card.js'
import { type Profile as ProfileRedis, User as UserRedis } from '@backend/database/deprecated/data/User.js'
import type { LandingPage as LandingPageRedis } from '@backend/database/deprecated/data/LandingPage.js'

import { dateToUnixTimestamp, dateOrNullToUnixTimestamp } from './dateHelpers.js'

/** @throws */
export const getRedisCardFromDrizzleCardVersion = async (queries: Queries, cardVersion: CardVersion): Promise<CardRedis> => {
  const lnurlP = await getRedisLnurlPForDrizzleCardVersion(queries, cardVersion)
  const { invoice, setFunding } = await getRedisInvoiceAndSetFundingForDrizzleCardVersion(queries, cardVersion, lnurlP)
  const { lnbitsWithdrawId, isLockedByBulkWithdraw, used } = await getRedisWithdrawInfoForDrizzleCardVersion(queries, cardVersion)

  return CardRedis.parse({
    cardHash: cardVersion.card,
    text: cardVersion.textForWithdraw,
    note: cardVersion.noteForStatusPage,
    invoice,
    setFunding,
    lnurlp: lnurlP,
    lnbitsWithdrawId,
    landingPageViewed: dateOrNullToUnixTimestamp(cardVersion.landingPageViewed),
    isLockedByBulkWithdraw,
    used,
  })
}

/** @throws */
export const getRedisLnurlPForDrizzleCardVersion = async (queries: Queries, cardVersion: CardVersion): Promise<CardRedis['lnurlp']> => {
  const lnurlp = await queries.getLnurlPFundingCardVersion(cardVersion)
  if (lnurlp == null) {
    return null
  }

  const invoices = await queries.getAllInvoicesFundingCardVersion(cardVersion)
  return {
    shared: cardVersion.sharedFunding,
    amount: invoices.reduce((total: number | null, current) => {
      if (total == null) {
        return current.amount
      }
      return total + current.amount
    }, null),
    payment_hash: invoices.reduce((total: Invoice['paymentHash'][] | null, current) => {
      if (total == null) {
        return [current.paymentHash]
      }
      return [...total, current.paymentHash]
    }, null),
    id: lnurlp.lnbitsId,
    created: dateToUnixTimestamp(lnurlp.created),
    paid: dateOrNullToUnixTimestamp(lnurlp.finished),
  }
}

/** @throws */
export const getRedisInvoiceAndSetFundingForDrizzleCardVersion = async (queries: Queries, cardVersion: CardVersion, lnurlp: CardRedis['lnurlp']): Promise<{
  invoice: CardRedis['invoice'],
  setFunding: CardRedis['setFunding'],
}> => {
  if (invoicesBelongToLnurlP(lnurlp)) {
    return { invoice: null, setFunding: null }
  }

  const invoices = await queries.getAllInvoicesFundingCardVersion(cardVersion)
  if (invoices.length === 0) {
    return { invoice: null, setFunding: null }
  }
  if (invoices.length > 1) {
    throw new Error(`More than one invoice found for card ${cardVersion.card}`)
  }

  const cardVersions = await queries.getAllCardVersionsFundedByInvoice(invoices[0])
  return {
    invoice: getRedisInvoiceForDrizzleInvoice(invoices[0], cardVersions),
    setFunding: getRedisSetFundingForDrizzleInvoice(invoices[0], cardVersions),
  }
}

const invoicesBelongToLnurlP = (lnurlp: CardRedis['lnurlp']) => lnurlp != null

export const getRedisInvoiceForDrizzleInvoice = (invoice: Invoice, cards: CardVersion[]): CardRedis['invoice'] => {
  if (cards.length !== 1) {
    return null
  }
  return {
    amount: invoice.amount,
    payment_hash: invoice.paymentHash,
    payment_request: invoice.paymentRequest,
    created: dateToUnixTimestamp(invoice.created),
    paid: dateOrNullToUnixTimestamp(invoice.paid),
  }
}

export const getRedisSetFundingForDrizzleInvoice = (invoice: Invoice, cards: CardVersion[]): CardRedis['setFunding'] => {
  if (cards.length < 2) {
    return null
  }
  return {
    amount: Math.round(invoice.amount / cards.length),
    created: dateToUnixTimestamp(invoice.created),
    paid: dateOrNullToUnixTimestamp(invoice.paid),
  }
}

/** @throws */
export const getRedisWithdrawInfoForDrizzleCardVersion = async (queries: Queries, card: CardVersion): Promise<{
  lnbitsWithdrawId: CardRedis['lnbitsWithdrawId'],
  isLockedByBulkWithdraw: CardRedis['isLockedByBulkWithdraw'],
  used: CardRedis['used'],
}> => {
  const lnurlw = await queries.getLnurlWWithdrawingCardVersion(card)
  if (lnurlw == null) {
    return { lnbitsWithdrawId: null, isLockedByBulkWithdraw: false, used: null }
  }
  return {
    lnbitsWithdrawId: lnurlw.bulkWithdrawId == null ? lnurlw.lnbitsId : null,
    isLockedByBulkWithdraw: lnurlw.bulkWithdrawId != null,
    used: dateOrNullToUnixTimestamp(lnurlw.withdrawn),
  }
}

export const redisLandingPageFromDrizzleLandingPage = async (queries: Queries, landingPage: LandingPage | null): Promise<LandingPageRedis | null> => {
  if (landingPage === null) {
    return null
  }

  // core landingPages are not saved in redis
  if (landingPage.type !== LandingPageType.enum.external) {
    return null
  }

  // core landingPages are not saved in redis
  const userCanUseLandingPage = (await queries.getUserCanUseLandingPagesByLandingPage(landingPage)).find((userCanUseLandingPage) => userCanUseLandingPage.canEdit)

  return {
    ...landingPage,
    userId: userCanUseLandingPage?.user || null,
    type: LandingPageType.enum.external,
  }
}

export const redisProfileFromDrizzleProfile = (profile: Profile): ProfileRedis => ({
  accountName: profile.accountName,
  displayName: profile.displayName,
  email: profile.email,
})

export const redisUserFromDrizzleUserOrNull = async (queries: Queries, user: User | null): Promise<UserRedis | null> => {
  if (user === null) {
    return null
  }
  return redisUserFromDrizzleUser(queries, user)
}

export const redisUserFromDrizzleUser = async (queries: Queries, user: User): Promise<UserRedis> => {
  const profile = await queries.getProfileByUserId(user.id)
  if (profile === null) {
    throw Error('Not Implemented - A redis user always has a profile. In drizzle it is possible that not.')
  }

  const availableCardsLogos = await getAvailableCardLogosForRedisUserByUserId(queries, user.id)
  const availableLandingPages = await getAvailableLandingPagesForRedisUserByUserId(queries, user.id)
  const allowedRefreshTokens = await getAllowedRefreshTokensForRedisUserByUserId(queries, user.id)

  return {
    id: user.id,
    lnurlAuthKey: user.lnurlAuthKey,
    created: dateToUnixTimestamp(user.created),
    availableCardsLogos,
    availableLandingPages,
    allowedRefreshTokens,
    profile: redisProfileFromDrizzleProfile(profile),
    permissions: UserRedis.shape.permissions.parse(user.permissions),
  }
}

export const getAvailableCardLogosForRedisUserByUserId = async (queries: Queries, userId: User['id']): Promise<UserRedis['availableCardsLogos']> => {
  const userCanUseImages = await queries.getAllUserCanUseImagesForUserId(userId)
  const availableCardLogos = userCanUseImages
    .map((userCanUseImage) => userCanUseImage.image)
  if (availableCardLogos.length === 0) {
    return null
  }
  return availableCardLogos
}

export const getAvailableLandingPagesForRedisUserByUserId = async (queries: Queries, userId: User['id']): Promise<UserRedis['availableLandingPages']> => {
  const userCanUseLandingPages = await queries.getAllUserCanUseLandingPagesForUserId(userId)
  const availableLandingPages = userCanUseLandingPages
    .map((userCanUseLandingPage) => userCanUseLandingPage.landingPage)
  if (availableLandingPages.length === 0) {
    return null
  }
  return availableLandingPages
}

export const getAllowedRefreshTokensForRedisUserByUserId = async (queries: Queries, userId: User['id']): Promise<UserRedis['allowedRefreshTokens']> => {
  const allowedRefreshTokens = await queries.getAllAllowedRefreshTokensForUserId(userId)
  if (allowedRefreshTokens.length === 0) {
    return null
  }
  return allowedRefreshTokens.reduce((total, allowedRefreshTokens) => [
    ...total,
    allowedRefreshTokens.previous != null ? [allowedRefreshTokens.current, allowedRefreshTokens.previous] : [allowedRefreshTokens.current],
  ], [] as string[][])
}
