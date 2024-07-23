import type { BulkWithdraw } from '@shared/data/trpc/BulkWithdraw.js'

import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/deprecated/data/BulkWithdraw.js'
import WithdrawDeletedError from '@backend/errors/WithdrawDeletedError.js'
import { isBulkWithdrawWithdrawn, loadCurrentLnurlFromLnbitsByWithdrawId } from '@backend/services/lnbitsHelpers.js'

/**
 * @throws WithdrawDeletedError
 * @throws ZodError
 * @throws AxiosError
 */
export const bulkWithdrawFromBulkWithdrawRedis = async (bulkWithdraw: BulkWithdrawRedis): Promise<BulkWithdraw> => {
  if (bulkWithdraw.lnbitsWithdrawDeleted) {
    throw new WithdrawDeletedError(`Lnbits withdraw link for bulkWithdraw ${bulkWithdraw.id} is already deleted, this bulkWithdraw cannot be used anymore.`)
  }
  return {
    id: bulkWithdraw.id,
    lnurl: await loadCurrentLnurlFromLnbitsByWithdrawId(bulkWithdraw.lnbitsWithdrawId),
    created: new Date(bulkWithdraw.created * 1000),
    amount: bulkWithdraw.amount,
    cards: bulkWithdraw.cards,
    withdrawPending: await isBulkWithdrawWithdrawn(bulkWithdraw),
    withdrawn: bulkWithdraw.withdrawn != null ? new Date(bulkWithdraw.withdrawn * 1000) : null,
  }
}
