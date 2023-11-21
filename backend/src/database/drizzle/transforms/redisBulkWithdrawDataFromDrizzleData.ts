import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/redis/data/BulkWithdraw'
import type { LnurlW } from '../schema'

import { getAllCardVersionsWithdrawnByLnurlW } from '../queries'
import { totalAmountForCards } from './drizzleCardHelpers'
import { dateToUnixTimestamp, dateOrNullToUnixTimestamp } from './dateHelpers'


/** @throws */
export const getRedisBulkWithdrawForDrizzleLnurlW = async (lnurlW: LnurlW): Promise<BulkWithdrawRedis> => {
  const cardVersions = await getAllCardVersionsWithdrawnByLnurlW(lnurlW)
  const amount = await totalAmountForCards(cardVersions)

  return {
    id: lnurlW.lnbitsId,
    created: dateToUnixTimestamp(lnurlW.created),
    withdrawn: dateOrNullToUnixTimestamp(lnurlW.withdrawn),
    lnbitsWithdrawId: lnurlW.lnbitsId,
    amount,
    cards: cardVersions.map(({ card }) => card),
    lnurl: 'PLEASE_REMOVE_ME', // TODO: remove lnurl from type BulkWithdrawRedis #784
    lnbitsWithdrawDeleted: null, // always hardcoded null as this won't be needed after migration to Drizzle
  }
}

/** @throws */
export const filterLnurlWsThatAreUsedForMultipleCards = async (lnurlWs: LnurlW[]): Promise<LnurlW[]> => {
  const lnurlWsThatAreUsedForMultipleCards: LnurlW[] = []
  await Promise.all(lnurlWs.map((lnurlW) => addIfUsedForMultipleCards(lnurlWsThatAreUsedForMultipleCards, lnurlW)))
  return lnurlWsThatAreUsedForMultipleCards
}

/**
 * side-effect: pushes into lnurlWsThatAreUsedForMultipleCards
 * @throws
 */
const addIfUsedForMultipleCards = async (lnurlWsThatAreUsedForMultipleCards: LnurlW[], lnurlW: LnurlW): Promise<void> => {
  if (await isUsedForMultipleCards(lnurlW)) {
    lnurlWsThatAreUsedForMultipleCards.push(lnurlW)
  }
}
/** @throws */
const isUsedForMultipleCards = async (lnurlW: LnurlW): Promise<boolean> => (await getAllCardVersionsWithdrawnByLnurlW(lnurlW)).length > 1

