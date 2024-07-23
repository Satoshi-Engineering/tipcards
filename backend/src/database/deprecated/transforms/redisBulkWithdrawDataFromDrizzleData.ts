import type { LnurlW } from '@backend/database/schema/index.js'
import type Queries from '@backend/database/Queries.js'
import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/deprecated/data/BulkWithdraw.js'

import { totalAmountForCards } from './drizzleCardHelpers.js'
import { dateToUnixTimestamp, dateOrNullToUnixTimestamp } from './dateHelpers.js'

/** @throws */
export const getRedisBulkWithdrawForDrizzleLnurlW = async (queries: Queries, lnurlW: LnurlW): Promise<BulkWithdrawRedis> => {
  if (lnurlW.bulkWithdrawId == null) {
    throw new Error(`Cannot create bulkWithdraw for lnurlW ${lnurlW.lnbitsId} as bulkWithdrawId is missing`)
  }
  const cardVersions = await queries.getAllCardVersionsWithdrawnByLnurlW(lnurlW)
  const amount = await totalAmountForCards(queries, cardVersions)

  return {
    id: lnurlW.bulkWithdrawId,
    created: dateToUnixTimestamp(lnurlW.created),
    withdrawn: dateOrNullToUnixTimestamp(lnurlW.withdrawn),
    lnbitsWithdrawId: lnurlW.lnbitsId,
    amount,
    cards: cardVersions.map(({ card }) => card),
    lnbitsWithdrawDeleted: null, // always hardcoded null as this won't be needed after migration to Drizzle
  }
}

/** @throws */
export const filterLnurlWsThatAreUsedForMultipleCards = async (queries: Queries, lnurlWs: LnurlW[]): Promise<LnurlW[]> => {
  const lnurlWsThatAreUsedForMultipleCards: LnurlW[] = []
  await Promise.all(lnurlWs.map((lnurlW) => addIfUsedForMultipleCards(queries, lnurlWsThatAreUsedForMultipleCards, lnurlW)))
  return lnurlWsThatAreUsedForMultipleCards
}

/**
 * side-effect: pushes into lnurlWsThatAreUsedForMultipleCards
 * @throws
 */
const addIfUsedForMultipleCards = async (queries: Queries, lnurlWsThatAreUsedForMultipleCards: LnurlW[], lnurlW: LnurlW): Promise<void> => {
  if (await isUsedForMultipleCards(queries, lnurlW)) {
    lnurlWsThatAreUsedForMultipleCards.push(lnurlW)
  }
}
/** @throws */
const isUsedForMultipleCards = async (queries: Queries, lnurlW: LnurlW): Promise<boolean> => (await queries.getAllCardVersionsWithdrawnByLnurlW(lnurlW)).length > 1

