import { CardHash } from '@shared/data/trpc/Card.js'
import { BulkWithdrawId, BulkWithdraw } from '@shared/data/trpc/BulkWithdraw.js'

import CardCollection from '@backend/modules/CardCollection.js'
import BulkWithdrawModule from '@backend/modules/BulkWithdraw.js'

import { router } from '../trpc.js'
import publicProcedure from '../procedures/public.js'
import {
  handleCardLockForMultipleCards,
  handleCardLockForBulkWithdraw,
  handleCardLockForBulkWithdrawByCardHash,
} from '../procedures/partials/handleCardLock.js'

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
