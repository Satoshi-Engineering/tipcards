import { Card, CardHash } from '@shared/data/trpc/Card.js'

import CardDeprecated from '@backend/modules/CardDeprecated.js'

import { router } from '../trpc.js'
import publicProcedure from '../procedures/public.js'
import { handleCardLockForSingleCard } from '../procedures/partials/handleCardLock.js'

export const cardRouter = router({
  /**
   * deprecated as is still uses deprecated (redis) queries
   * @deprecated
   */
  getByHash: publicProcedure
    .input(CardHash)
    .output(Card)
    .unstable_concat(handleCardLockForSingleCard)
    .query(async ({ input }) => {
      const card = await CardDeprecated.fromCardHashOrDefault(input.hash)
      return await card.toTRpcResponse()
    }),

  landingPageViewed: publicProcedure
    .input(CardHash)
    .unstable_concat(handleCardLockForSingleCard)
    .mutation(async ({ input }) => {
      const card = await CardDeprecated.fromCardHash(input.hash)
      await card.setLandingPageViewed()
    }),
})
