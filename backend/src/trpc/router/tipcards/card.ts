import { Card, CardHash } from '@shared/data/trpc/tipcards/Card.js'
import { CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto.js'

import CardDeprecated from '@backend/domain/CardDeprecated.js'
import CardStatus from '@backend/domain/CardStatus.js'
// todo : do not rename on import, instead change it to CardStatus and rename trpc/CardStatus to CardStatusDto

import { router } from '../../trpc.js'
import publicProcedure from '../../procedures/public.js'
import { handleCardLockForSingleCard } from '../../procedures/partials/handleCardLock.js'

export const cardRouter = router({
  /**
   * deprecated as it still uses deprecated (redis) queries
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

  status: publicProcedure
    .input(CardHash)
    .output(CardStatusDto)
    .query(async ({ input }) => {
      const cardStatus = await CardStatus.latestFromCardHashOrDefault(input.hash)
      return cardStatus.toTrpcResponse()
    }),

  landingPageViewed: publicProcedure
    .input(CardHash)
    .unstable_concat(handleCardLockForSingleCard)
    .mutation(async ({ input }) => {
      const card = await CardDeprecated.fromCardHash(input.hash)
      await card.setLandingPageViewed()
    }),
})
