import { Card } from '@shared/data/trpc/Card.js'
import { SetDto } from '@shared/data/trpc/SetDto.js'
import { SetCardsInfoDto } from '@shared/data/trpc/SetCardsInfoDto.js'
import { SetDeprecatedId } from '@shared/data/trpc/Set.js'

import Set from '@backend/domain/Set.js'
import SetCollection from '@backend/domain/SetCollection.js'

import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

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

  getCardsInfoBySetId: loggedInProcedure
    .input(SetDto.shape.id)
    .output(SetCardsInfoDto)
    .query(async ({ input }) => {
      const set = await Set.fromId(input)
      return set.getCardsInfo()
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
