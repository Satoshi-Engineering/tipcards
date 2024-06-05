import { Card as CardTrpc } from '@shared/data/trpc/Card'

import Card from '@backend/modules/Card'

import { router, publicProcedure } from '../trpc'

export const cardRouter = router({
  getByHash: publicProcedure
    .input(CardTrpc.shape.hash)
    .output(CardTrpc)
    .query(async ({ input }) => {
      const card = await Card.fromCardHash(input)
      return await card.toTRpcResponse()
    }),

  landingPageViewed: publicProcedure
    .input(CardTrpc.shape.hash)
    .mutation(async ({ input }) => {
      const card = await Card.fromCardHash(input)
      await card.setLandingPageViewed()
    }),
})
