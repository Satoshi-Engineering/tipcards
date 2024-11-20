import { Card } from '@shared/data/trpc/Card.js'
import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import { SetDeprecatedId } from '@shared/data/trpc/Set.js'

import Set from '@backend/domain/Set.js'
import SetCollection from '@backend/domain/SetCollection.js'

import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

import { router } from '../../trpc.js'
import publicProcedure from '../../procedures/public.js'
import loggedInProcedure from '../../procedures/loggedIn.js'
import { handleCardLockForSet } from '../../procedures/partials/handleCardLock.js'
import { z } from 'zod'

export const setRouter = router({
  getAll: loggedInProcedure
    .output(SetDto.array())
    .query(async ({ ctx }) => {
      const setCollection = await SetCollection.fromUserId(ctx.accessToken.userId)
      return setCollection.sets
    }),

  getLatestChanged: loggedInProcedure
    .input(z.object({ limit: z.number().optional() }))
    .output(SetDto.array())
    .query(async ({ ctx, input }) => {
      const setCollection = await SetCollection.fromUserId(ctx.accessToken.userId, {
        sorting: 'changed',
        sortingDirection: 'DESC',
        limit: input.limit,
      })
      return setCollection.sets
    }),

  getCardsSummaryBySetId: loggedInProcedure
    .input(SetDto.shape.id)
    .output(CardsSummaryDto)
    .query(async ({ input }) => {
      const set = await Set.fromId(input)
      return set.getCardsSummary()
    }),

  getCards: publicProcedure
    .input(SetDeprecatedId)
    .output(Card.array())
    .unstable_concat(handleCardLockForSet)
    .query(async ({ input }) => {
      const cards = await CardCollectionDeprecated.fromSetId(input.id)
      return await cards.toTRpcResponse()
    }),
})
