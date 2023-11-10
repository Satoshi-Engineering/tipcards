import { Card } from '@shared/data/trpc/Card'
import { BulkWithdraw as BulkWithdrawTrpc } from '@shared/data/trpc/BulkWithdraw'

import CardCollection from '@backend/modules/CardCollection'
import BulkWithdraw from '@backend/modules/BulkWithdraw'

import { router, publicProcedure } from '../trpc'

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
      const cards = await CardCollection.fromCardHashes(input)
      const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
      await bulkWithdraw.create()
      return bulkWithdraw.toTRpcResponse()
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
