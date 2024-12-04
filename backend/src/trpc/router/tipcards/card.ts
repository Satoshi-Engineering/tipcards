import { on } from 'node:events'
import z from 'zod'

import { Card, CardHash } from '@shared/data/trpc/Card.js'
import { CardStatusDto } from '@shared/data/trpc/CardStatusDto.js'
import { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'

import { cardUpdateEvent } from '@backend/domain/ApplicationEventEmitter.js'
import CardDeprecated from '@backend/domain/CardDeprecated.js'
import CardStatusForHistoryCollection from '@backend/domain/CardStatusForHistoryCollection.js'
import LiveCardStatus from '@backend/domain/LiveCardStatus.js'
import SetCollection from '@backend/domain/SetCollection.js'

import { router } from '../../trpc.js'
import loggedInProcedure from '../../procedures/loggedIn.js'
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

      const cardStatus = await LiveCardStatus.latestFromCardHashOrDefault(input.hash)
      yield CardStatusDto.parse(cardStatus.toTrpcResponse())

      // eslint-disable-next-line
      for await (const _ of iterator) {
        const cardStatus = await LiveCardStatus.latestFromCardHashOrDefault(input.hash)
        yield CardStatusDto.parse(cardStatus.toTrpcResponse())
      }
    }),

  cardsSummary: loggedInProcedure
    .output(CardsSummaryDto)
    .query(async ({ ctx }) => {
      const setCollection = await SetCollection.fromUserId(ctx.loggedInUser.id)
      const cardStatusCollection = await setCollection.getCardStatusCollection()
      return cardStatusCollection.summary.toTRpcResponse()
    }),

  cardHistory: loggedInProcedure
    .input(z.object({
      offset: z.number(),
      limit: z.number(),
    }).optional())
    .output(z.object({
      data: CardStatusForHistoryDto.array(),
      totalUnfiltered: z.number(),
      pagination: z.object({
        offset: z.number(),
        limit: z.number(),
        total: z.number(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const setCollection = await SetCollection.fromUserId(ctx.loggedInUser.id)
      const cardHashes = setCollection.getAllCardHashes()
      const cardStatusCollection = await CardStatusForHistoryCollection.fromCardHashes(cardHashes)
      cardStatusCollection.filter = (cardStatus) => cardStatus.status !== 'unfunded'
      cardStatusCollection.sort = (a, b) => b.updated.getTime() - a.updated.getTime()
      if (input) {
        cardStatusCollection.pagination = input
      }

      return cardStatusCollection.toTrpcResponse()
    }),

  landingPageViewed: publicProcedure
    .input(CardHash)
    .unstable_concat(handleCardLockForSingleCard)
    .mutation(async ({ input }) => {
      const card = await CardDeprecated.fromCardHash(input.hash)
      await card.setLandingPageViewed()
    }),
})
