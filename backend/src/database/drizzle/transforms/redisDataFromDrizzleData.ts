import type {
  User,
  CardVersion,
  Invoice,
  LandingPage,
  Profile,
} from '@backend/database/drizzle/schema'
import { LandingPageType } from '@backend/database/drizzle/schema/LandingPage'
import {
  getLnurlPFundingCardVersion,
  getAllInvoicesFundingCardVersion,
  getAllCardVersionsFundedByInvoice,
  getLnurlWWithdrawingCardVersion,
  getAllCardVersionsWithdrawnByLnurlW,
  getUserCanUseLandingPagesByLandingPage as getDrizzleUserCanUseLandingPagesByLandingPage,
  getProfileByUserId as getDrizzleProfileByUserId,
  getAllUserCanUseImagesForUserId,
  getAllUserCanUseLandingPagesForUserId,
  getAllAllowedRefreshTokensForUserId,
} from '@backend/database/drizzle/queries'
import { Card as CardRedis } from '@backend/database/redis/data/Card'
import {
  Profile as ProfileRedis,
  User as UserRedis } from '@backend/database/redis/data/User'
import { LandingPage as LandingPageRedis } from '@backend/database/redis/data/LandingPage'

import { dateToUnixTimestamp, dateOrNullToUnixTimestamp } from './dateHelpers'

/** @throws */
export const getRedisCardFromDrizzleCardVersion = async (cardVersion: CardVersion): Promise<CardRedis> => {
  const lnurlP = await getRedisLnurlPForDrizzleCardVersion(cardVersion)
  const { invoice, setFunding } = await getRedisInvoiceAndSetFundingForDrizzleCardVersion(cardVersion, lnurlP)
  const { lnbitsWithdrawId, isLockedByBulkWithdraw, used } = await getRedisWithdrawInfoForDrizzleCardVersion(cardVersion)

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
export const getRedisLnurlPForDrizzleCardVersion = async (cardVersion: CardVersion): Promise<CardRedis['lnurlp']> => {
  const lnurlp = await getLnurlPFundingCardVersion(cardVersion)
  if (lnurlp == null) {
    return null
  }

  const invoices = await getAllInvoicesFundingCardVersion(cardVersion)
  return {
    shared: cardVersion.sharedFunding,
    amount: invoices.reduce((total, current) => total + current.amount, 0),
    payment_hash: invoices.reduce((total, current) => [...total, current.paymentHash], [] as Invoice['paymentHash'][]),
    id: lnurlp.lnbitsId,
    created: dateToUnixTimestamp(lnurlp.created),
    paid: dateOrNullToUnixTimestamp(lnurlp.finished),
  }
}

/** @throws */
export const getRedisInvoiceAndSetFundingForDrizzleCardVersion = async (cardVersion: CardVersion, lnurlp: CardRedis['lnurlp']): Promise<{
  invoice: CardRedis['invoice'],
  setFunding: CardRedis['setFunding'],
}> => {
  if (invoicesBelongToLnurlP(lnurlp)) {
    return { invoice: null, setFunding: null }
  }

  const invoices = await getAllInvoicesFundingCardVersion(cardVersion)
  if (invoices.length === 0) {
    return { invoice: null, setFunding: null }
  }
  if (invoices.length > 1) {
    throw new Error(`More than one invoice found for card ${cardVersion.card}`)
  }

  const cardVersions = await getAllCardVersionsFundedByInvoice(invoices[0])
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
export const getRedisWithdrawInfoForDrizzleCardVersion = async (card: CardVersion): Promise<{
  lnbitsWithdrawId: CardRedis['lnbitsWithdrawId'],
  isLockedByBulkWithdraw: CardRedis['isLockedByBulkWithdraw'],
  used: CardRedis['used'],
}> => {
  const lnurlw = await getLnurlWWithdrawingCardVersion(card)
  if (lnurlw == null) {
    return { lnbitsWithdrawId: null, isLockedByBulkWithdraw: false, used: null }
  }
  const cardVersions = await getAllCardVersionsWithdrawnByLnurlW(lnurlw)
  return {
    lnbitsWithdrawId: lnurlw.lnbitsId,
    isLockedByBulkWithdraw: cardVersions.length > 1,
    used: dateOrNullToUnixTimestamp(lnurlw.withdrawn),
  }
}

export const redisLandingPageFromDrizzleLandingPage = async (landingPage: LandingPage | null): Promise<LandingPageRedis | null> => {
  if (landingPage === null) {
    return null
  }

  if (landingPage.type !== LandingPageType.enum.external) {
    throw new Error(`Invalid type for landingPage ${landingPage.id}, only "${LandingPageType.enum.external}" allowed for LandingPageRedis!`)
  }

  // due to redis having no m:n relationship, the first n:m user is taken
  const userCanUseLandingPages = await getDrizzleUserCanUseLandingPagesByLandingPage(landingPage)

  if (userCanUseLandingPages.length <= 0) {
    throw Error(`Missing userCanUseLandingPage for landingPage ${landingPage.id}, userId is required for LandingPageRedis!`)
  }

  return {
    ...landingPage,
    userId: userCanUseLandingPages[0].user,
    type: LandingPageType.enum.external,
  }
}

export const redisProfileFromDrizzleProfile = (profile: Profile): ProfileRedis => ({
  accountName: profile.accountName,
  displayName: profile.displayName,
  email: profile.email,
})

export const redisUserFromDrizzleUserOrNull = async (user: User | null): Promise<UserRedis | null> => {
  if (user === null) {
    return null
  }
  return redisUserFromDrizzleUser(user)
}

export const redisUserFromDrizzleUser = async (user: User): Promise<UserRedis> => {
  const profile = await getDrizzleProfileByUserId(user.id)
  if (profile === null) {
    throw Error('Not Implemented - A redis user always has a profile. In drizzle it is possible that not.')
  }

  const availableCardsLogos = await getAvailableCardLogosForRedisUserByUserId(user.id)
  const availableLandingPages = await getAvailableLandingPagesForRedisUserByUserId(user.id)
  const allowedRefreshTokens = await getAllowedRefreshTokensForRedisUserByUserId(user.id)

  return {
    id: user.id,
    lnurlAuthKey: user.lnurlAuthKey,
    created: dateToUnixTimestamp(user.created),
    availableCardsLogos,
    availableLandingPages,
    allowedRefreshTokens,
    profile: redisProfileFromDrizzleProfile(profile),
    permissions: [],
  }
}

export const getAvailableCardLogosForRedisUserByUserId = async (userId: User['id']): Promise<UserRedis['availableCardsLogos']> => {
  const userCanUseImages = await getAllUserCanUseImagesForUserId(userId)
  const availableCardLogos = userCanUseImages
    .filter((userCanUseImage) => userCanUseImage.canEdit)
    .map((userCanUseImage) => userCanUseImage.image)
  if (availableCardLogos.length === 0) {
    return null
  }
  return availableCardLogos
}

export const getAvailableLandingPagesForRedisUserByUserId = async (userId: User['id']): Promise<UserRedis['availableLandingPages']> => {
  const userCanUseLandingPages = await getAllUserCanUseLandingPagesForUserId(userId)
  const availableLandingPages = userCanUseLandingPages
    .filter((userCanUseLandingPage) => userCanUseLandingPage.canEdit)
    .map((userCanUseLandingPage) => userCanUseLandingPage.landingPage)
  if (availableLandingPages.length === 0) {
    return null
  }
  return availableLandingPages
}

export const getAllowedRefreshTokensForRedisUserByUserId = async (userId: User['id']): Promise<UserRedis['allowedRefreshTokens']> => {
  const allowedRefreshTokens = await getAllAllowedRefreshTokensForUserId(userId)
  if (allowedRefreshTokens.length === 0) {
    return null
  }
  return allowedRefreshTokens.reduce((total, allowedRefreshTokens) => [
    ...total,
    allowedRefreshTokens.previous != null ? [allowedRefreshTokens.previous, allowedRefreshTokens.current] : [allowedRefreshTokens.current],
  ], [] as string[][])
}
