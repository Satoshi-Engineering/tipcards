import { Card } from '@shared/data/trpc/tipcards/Card.js'
import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'
import { SetStatisticsDto } from '@shared/data/trpc/tipcards/SetStatisticsDto.js'
import { SetDeprecatedId } from '@shared/data/trpc/tipcards/Set.js'

import Set from '@backend/domain/tipcards/Set.js'
import SetCollection from '@backend/domain/tipcards/SetCollection.js'

import CardCollectionDeprecated from '@backend/domain/tipcards/CardCollectionDeprecated.js'

import { router } from '../../trpc.js'
import publicProcedure from '../../procedures/public.js'
import loggedInProcedure from '../../procedures/loggedIn.js'
import { handleCardLockForSet } from '../../procedures/partials/handleCardLock.js'

export const setRouter = router({
  getAll: loggedInProcedure
    .output(SetDto.array())
    .query(async ({ ctx }) => {
      const setCollection = await SetCollection.fromUserId(ctx.accessToken.id)
      return setCollection.sets
    }),

  getStatisticsBySetId: loggedInProcedure
    .input(SetDto.shape.id)
    .output(SetStatisticsDto)
    .query(async ({ input }) => {
      const set = await Set.fromId(input)
      return set.getStatistics()
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
