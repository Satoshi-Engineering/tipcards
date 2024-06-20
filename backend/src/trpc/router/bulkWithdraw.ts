import { Card } from '@shared/data/trpc/Card'
import { BulkWithdraw as BulkWithdrawTrpc } from '@shared/data/trpc/BulkWithdraw'

import CardCollection from '@backend/modules/CardCollection'
import BulkWithdraw from '@backend/modules/BulkWithdraw'
import { lockCards, releaseCards } from '@backend/services/databaseCardLock'

import { router } from '../trpc'
import publicProcedure from '../procedures/public'

export const bulkWithdrawRouter = router({
  getById: publicProcedure
    .input(BulkWithdrawTrpc.shape.id)
    .output(BulkWithdrawTrpc)
    .query(async ({ input }) => {
      const bulkWithdraw = await BulkWithdraw.fromId(input)
      return bulkWithdraw.toTRpcResponse()
    }),

  createForCards: publicProcedure
    .input(Card.shape.hash.array())
    .output(BulkWithdrawTrpc)
    .mutation(async ({ input }) => {
      const lockValues = await lockCards(input)
      try {
        const cards = await CardCollection.fromCardHashes(input)
        const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
        await bulkWithdraw.create()
        return bulkWithdraw.toTRpcResponse()
      } finally {
        await releaseCards(lockValues)
      }
    }),

  deleteById: publicProcedure
    .input(BulkWithdrawTrpc.shape.id)
    .mutation(async ({ input }) => {
      const bulkWithdraw = await BulkWithdraw.fromId(input)
      await bulkWithdraw.delete()
    }),

  deleteByCardHash: publicProcedure
    .input(Card.shape.hash)
    .mutation(async ({ input }) => {
      const bulkWithdraw = await BulkWithdraw.fromCardHash(input)
      await bulkWithdraw.delete()
    }),
})
