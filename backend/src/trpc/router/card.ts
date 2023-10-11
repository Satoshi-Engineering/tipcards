import { Card } from '../data/Card'
import { BulkWithdraw } from '../data/BulkWithdraw'
import {
  router,
  publicProcedure,
} from '../trpc'

export const cardRouter = router({
  bulkWithdraw: publicProcedure
    .input(Card.shape.hash.array())
    .output(BulkWithdraw)
    .mutation(async () => {
      return BulkWithdraw.parse({})
    }),
})
