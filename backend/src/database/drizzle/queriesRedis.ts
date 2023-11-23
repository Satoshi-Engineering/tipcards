import NotFoundError from '@backend/errors/NotFoundError'

import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/redis/data/BulkWithdraw'
import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import type { Set as SetRedis } from '@backend/database/redis/data/Set'
import type { LandingPage as LandingPageRedis } from '@backend/database/redis/data/LandingPage'

import { getRedisCardFromDrizzleCardVersion } from './transforms/redisDataFromDrizzleData'
import { getDrizzleDataObjectsFromRedisCard, getDrizzleLnurlWFromRedisBulkWithdraw } from './transforms/drizzleDataFromRedisData'
import { getDrizzleDataObjectsForRedisCardChanges } from './transforms/drizzleDataForRedisCardChanges'
import { getDrizzleDataObjectsForRedisCardDelete } from './transforms/drizzleDataForRedisCardDelete'
import { getRedisSetFromDrizzleSet } from './transforms/redisSetDataFromDrizzleData'
import { getDrizzleDataObjectsForRedisSet } from './transforms/drizzleSetDataForRedisSet'
import { getRedisBulkWithdrawForDrizzleLnurlW, filterLnurlWsThatAreUsedForMultipleCards } from './transforms/redisBulkWithdrawDataFromDrizzleData'
import { insertDataObjects, insertOrUpdateDataObjects, deleteDataObjects } from './batchQueries'
import {
  getLatestCardVersion,
  getSetById as getDrizzleSetById,
  getSetsByUserId as getDrizzleSetsByUserId,
  getLandingPage as getDrizzleLandingPage,
  getUserCanUseLandingPagesByLandingPageId as getDrizzleUserCanUseLandingPagesByLandingPageId,
  getLnurlWById,
  getAllLnurlWs,
  insertOrUpdateLnurlW,
  updateCardVersion,
} from './queries'
import { LandingPageType } from '@backend/database/drizzle/schema/LandingPage'

/** @throws */
export const getCardByHash = async (cardHash: string): Promise<CardRedis | null> => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    return null
  }
  return getRedisCardFromDrizzleCardVersion(cardVersion)
}

/** @throws */
export const createCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = getDrizzleDataObjectsFromRedisCard(cardRedis)
  await insertDataObjects(drizzleData)
}

/** @throws */
export const updateCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisCardChanges(cardRedis)
  await insertOrUpdateDataObjects(drizzleData.insertOrUpdate)
  await deleteDataObjects(drizzleData.delete)
}

/** @throws */
export const deleteCard = async (cardRedis: CardRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisCardDelete(cardRedis)
  await deleteDataObjects(drizzleData)
}

/** @throws */
export const getSetById = async (setId: SetRedis['id']): Promise<SetRedis | null> => {
  const set = await getDrizzleSetById(setId)
  if (set == null) {
    return null
  }
  return getRedisSetFromDrizzleSet(set)
}

/** @throws */
export const getSetsByUserId = async (userId: string): Promise<SetRedis[]> => {
  const sets = await getDrizzleSetsByUserId(userId)
  const setsRedis = await Promise.all(sets.map((set) => getRedisSetFromDrizzleSet(set)))
  return setsRedis
}

/** @throws */
export const createSet = async (set: SetRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisSet(set)
  await insertOrUpdateDataObjects(drizzleData.insertOrUpdate)
}

/** @throws */
export const updateSet = async (set: SetRedis): Promise<void> => {
  const drizzleData = await getDrizzleDataObjectsForRedisSet(set)
  await insertOrUpdateDataObjects(drizzleData.insertOrUpdate)
  await deleteDataObjects(drizzleData.delete)
}

export const createBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis): Promise<void> => {
  const lnurlW = getDrizzleLnurlWFromRedisBulkWithdraw(bulkWithdraw)
  await insertOrUpdateLnurlW(lnurlW)
  linkLatestCardVersionsToLnurlW(bulkWithdraw.cards, lnurlW.lnbitsId)
}
const linkLatestCardVersionsToLnurlW = async (cardHashes: CardRedis['cardHash'][], lnurlWlnbitsId: BulkWithdrawRedis['lnbitsWithdrawId']) => {
  await Promise.all(
    cardHashes.map(async (cardHash) => linkLatestCardVersionToLnurlW(cardHash, lnurlWlnbitsId)),
  )
}
const linkLatestCardVersionToLnurlW = async (cardHash: CardRedis['cardHash'], lnurlWlnbitsId: BulkWithdrawRedis['lnbitsWithdrawId']) => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    throw new NotFoundError(`Card ${cardHash} not found.`)
  }
  await updateCardVersion({
    ...cardVersion,
    lnurlW: lnurlWlnbitsId,
  })
}

/** @throws */
export const getBulkWithdrawById = async (lnbitsLnurlWId: string): Promise<BulkWithdrawRedis> => {
  const lnurlW = await getLnurlWById(lnbitsLnurlWId)
  if (lnurlW == null) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  const bulkWithdrawRedis = getRedisBulkWithdrawForDrizzleLnurlW(lnurlW)
  return bulkWithdrawRedis
}

/** @throws */
export const updateBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis): Promise<void> => {
  const lnurlW = getDrizzleLnurlWFromRedisBulkWithdraw(bulkWithdraw)
  await insertOrUpdateLnurlW(lnurlW)
}

/** @throws */
export const deleteBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis): Promise<void> => {
  await getBulkWithdrawById(bulkWithdraw.lnbitsWithdrawId)
  await unlinkLatestCardVersionsFromLnurlW(bulkWithdraw.cards)
}
const unlinkLatestCardVersionsFromLnurlW = async (cardHashes: CardRedis['cardHash'][]) => {
  await Promise.all(
    cardHashes.map(unlinkLatestCardVersionFromLnurlW),
  )
}
const unlinkLatestCardVersionFromLnurlW = async (cardHash: CardRedis['cardHash']) => {
  const cardVersion = await getLatestCardVersion(cardHash)
  if (cardVersion == null) {
    throw new NotFoundError(`Card ${cardHash} not found.`)
  }
  await updateCardVersion({
    ...cardVersion,
    lnurlW: null,
  })
}

/** @throws */
export const getAllBulkWithdraws = async (): Promise<BulkWithdrawRedis[]> => {
  const allLnurlWs = await getAllLnurlWs()
  const lnurlWsForMultipleCards = await filterLnurlWsThatAreUsedForMultipleCards(allLnurlWs)
  const bulkWithdraws = await Promise.all(
    lnurlWsForMultipleCards.map(
      async ({ lnbitsId }) => await getBulkWithdrawById(lnbitsId),
    ),
  )
  return bulkWithdraws
}

/**
 * @param landingPageId string
 * @throws
 */
export const getLandingPage = async (landingPageId: string): Promise<LandingPageRedis | null> => {
  const landingPage = await getDrizzleLandingPage(landingPageId)
  if (landingPage === null) {
    return null
  }

  if (landingPage.type !== LandingPageType[1]) {
    throw new Error('Not Implemented')
  }

  // TODO: Due Redis, has no m:n relationship, automatically the first n:m user is taken
  console.warn('TODO: Due Redis, has no m:n relationship, automatically the first n:m user is taken')
  const userCanUseLandingPages = await getDrizzleUserCanUseLandingPagesByLandingPageId(landingPage)

  if (userCanUseLandingPages.length <= 0) throw Error('not Implemented')

  return {
    ...landingPage,
    userId: userCanUseLandingPages[0].user,
    type: 'external', // LandingPageType[1]
  }
}
