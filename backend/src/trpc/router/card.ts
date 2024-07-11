import { Card, CardHash } from '@shared/data/trpc/Card.js'

import CardModule from '@backend/modules/Card.js'

import { router } from '../trpc.js'
import publicProcedure from '../procedures/public.js'
import { handleCardLockForSingleCard } from '../procedures/partials/handleCardLock.js'

export const cardRouter = router({
  getByHash: publicProcedure
    .input(CardHash)
    .output(Card)
    .unstable_concat(handleCardLockForSingleCard)
    .query(async ({ input }) => {
      const card = await CardModule.fromCardHashOrDefault(input.hash)
      return await card.toTRpcResponse()
    }),

  landingPageViewed: publicProcedure
    .input(CardHash)
    .unstable_concat(handleCardLockForSingleCard)
    .mutation(async ({ input }) => {
      const card = await CardModule.fromCardHash(input.hash)
      await card.setLandingPageViewed()
    }),
})
