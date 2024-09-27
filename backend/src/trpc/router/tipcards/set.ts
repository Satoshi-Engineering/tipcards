import { Card } from '@shared/data/trpc/tipcards/Card.js'
import { SetId } from '@shared/data/trpc/tipcards/Set.js'
import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'

import CardCollectionDeprecated from '@backend/domain/tipcards/CardCollectionDeprecated.js'
import SetCollection from '@backend/domain/tipcards/SetCollection.js'

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

  getCards: publicProcedure
    .input(SetId)
    .output(Card.array())
    .unstable_concat(handleCardLockForSet)
    .query(async ({ input }) => {
      const cards = await CardCollectionDeprecated.fromSetId(input.id)
      return await cards.toTRpcResponse()
    }),
})
