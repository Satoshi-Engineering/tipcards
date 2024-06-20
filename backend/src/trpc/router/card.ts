import { Card } from '@shared/data/trpc/Card'

import CardModule from '@backend/modules/Card'

import { router } from '../trpc'
import publicProcedure from '../procedures/public'

export const cardRouter = router({
  getByHash: publicProcedure
    .input(Card.shape.hash)
    .output(Card)
    .query(async ({ input }) => {
      const card = await CardModule.fromCardHashOrDefault(input)
      return await card.toTRpcResponse()
    }),

  landingPageViewed: publicProcedure
    .input(Card.shape.hash)
    .mutation(async ({ input }) => {
      const card = await CardModule.fromCardHash(input)
      await card.setLandingPageViewed()
    }),
})
