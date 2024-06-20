import { Card, CardHash } from '@shared/data/trpc/Card'

import CardModule from '@backend/modules/Card'

import { router } from '../trpc'
import publicProcedure from '../procedures/public'
import { handleCardLockForSingleCard } from '../procedures/partials/handleCardLock'

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
