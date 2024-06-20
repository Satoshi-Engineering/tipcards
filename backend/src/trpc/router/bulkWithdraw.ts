import { CardHash } from '@shared/data/trpc/Card'
import { BulkWithdrawId, BulkWithdraw } from '@shared/data/trpc/BulkWithdraw'

import CardCollection from '@backend/modules/CardCollection'
import BulkWithdrawModule from '@backend/modules/BulkWithdraw'

import { router } from '../trpc'
import publicProcedure from '../procedures/public'
import {
  handleCardLockForMultipleCards,
  handleCardLockForBulkWithdraw,
  handleCardLockForBulkWithdrawByCardHash,
} from '../procedures/partials/handleCardLock'

export const bulkWithdrawRouter = router({
  getById: publicProcedure
    .input(BulkWithdraw.shape.id)
    .output(BulkWithdraw)
    .query(async ({ input }) => {
      const bulkWithdraw = await BulkWithdrawModule.fromId(input)
      return bulkWithdraw.toTRpcResponse()
    }),

  createForCards: publicProcedure
    .input(CardHash.shape.hash.array())
    .output(BulkWithdraw)
    .unstable_concat(handleCardLockForMultipleCards)
    .mutation(async ({ input }) => {
      const cards = await CardCollection.fromCardHashes(input)
      const bulkWithdraw = BulkWithdrawModule.fromCardCollection(cards)
      await bulkWithdraw.create()
      return bulkWithdraw.toTRpcResponse()
    }),

  deleteById: publicProcedure
    .input(BulkWithdrawId)
    .unstable_concat(handleCardLockForBulkWithdraw)
    .mutation(async ({ input }) => {
      const bulkWithdraw = await BulkWithdrawModule.fromId(input.id)
      await bulkWithdraw.delete()
    }),

  deleteByCardHash: publicProcedure
    .input(CardHash)
    .unstable_concat(handleCardLockForBulkWithdrawByCardHash)
    .mutation(async ({ input }) => {
      const bulkWithdraw = await BulkWithdrawModule.fromCardHash(input.hash)
      await bulkWithdraw.delete()
    }),
})
