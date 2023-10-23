import { BulkWithdraw as ZodBulkWithdrawRedis } from '../../../../src/data/redis/BulkWithdraw'

import CardCollection from '../../modules/CardCollection'
import BulkWithdraw from '../../modules/BulkWithdraw'

import { Card } from '../data/Card'
import { BulkWithdraw as BulkWithdrawTrpc } from '../data/BulkWithdraw'
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
    .input(ZodBulkWithdrawRedis.shape.id)
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
