import { on } from 'node:events'

import { Card, CardHash } from '@shared/data/trpc/Card.js'
import { CardStatusDto } from '@shared/data/trpc/CardStatusDto.js'

import { cardUpdateEvent } from '@backend/domain/ApplicationEventEmitter.js'
import CardDeprecated from '@backend/domain/CardDeprecated.js'
import CardStatus from '@backend/domain/CardStatus.js'

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
    // todo: add output type definition/validation:
    // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1300#note_19422
    //.output(CardStatusDto)
    .subscription(async function* ({
      ctx,
      input,
      signal,
    }): AsyncGenerator<CardStatusDto> {
      // create iterator first so we do not miss events during fetch of initial data
      const iterator = on(
        ctx.applicationEventEmitter,
        cardUpdateEvent(input.hash),
        { signal },
      )

      const cardStatus = await CardStatus.latestFromCardHashOrDefault(input.hash)
      yield CardStatusDto.parse(cardStatus.toTrpcResponse())

      // eslint-disable-next-line
      for await (const _ of iterator) {
        const cardStatus = await CardStatus.latestFromCardHashOrDefault(input.hash)
        yield CardStatusDto.parse(cardStatus.toTrpcResponse())
      }
    }),

  landingPageViewed: publicProcedure
    .input(CardHash)
    .unstable_concat(handleCardLockForSingleCard)
    .mutation(async ({ input }) => {
      const card = await CardDeprecated.fromCardHash(input.hash)
      await card.setLandingPageViewed()
    }),
})
