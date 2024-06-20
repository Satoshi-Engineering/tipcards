import { Card } from '@shared/data/trpc/Card'
import { Set, SetId } from '@shared/data/trpc/Set'

import CardCollection from '@backend/modules/CardCollection'
import { getSetsByUserId } from '@backend/database/queries'

import { setFromSetRedis } from '../data/transforms/setFromSetRedis'
import { router } from '../trpc'
import publicProcedure from '../procedures/public'
import loggedInProcedure from '../procedures/loggedIn'
import { handleCardLockForSet } from '../procedures/partials/handleCardLock'

export const setRouter = router({
  getAll: loggedInProcedure
    .output(Set.array())
    .query(async ({ ctx }) => {
      const setsDatabase = await getSetsByUserId(ctx.accessToken.id)
      return setsDatabase.map((set) => setFromSetRedis(set))
    }),

  getCards: publicProcedure
    .input(SetId)
    .output(Card.array())
    .unstable_concat(handleCardLockForSet)
    .query(async ({ input }) => {
      const cards = await CardCollection.fromSetId(input.id)
      return await cards.toTRpcResponse()
    }),
})
