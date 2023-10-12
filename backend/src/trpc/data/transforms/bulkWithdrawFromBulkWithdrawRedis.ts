import type { BulkWithdraw as BulkWithdrawRedis } from '../../../../../src/data/redis/BulkWithdraw'

import { isBulkWithdrawWithdrawn } from '../../../services/lnbitsHelpers'

import { BulkWithdraw } from '../BulkWithdraw'

export const bulkWithdrawFromBulkWithdrawRedis = async (bulkWithdraw: BulkWithdrawRedis) => BulkWithdraw.parse({
  lnurl: bulkWithdraw.lnurl,
  created: bulkWithdraw.created,
  amount: bulkWithdraw.amount,
  numberOfCards: bulkWithdraw.cards.length,
  withdrawPending: await isBulkWithdrawWithdrawn(bulkWithdraw),
  withdrawn: bulkWithdraw.withdrawn,
})
