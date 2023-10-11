import CardCollectionRedis from '../../modules/CardCollectionRedis'
import { getSetsByUserId } from '../../services/database'

import { SetFromSetDatabase } from '../data/transforms/SetFromSetDatabase'
import { Card } from '../data/Card'
import { Set } from '../data/Set'
import { router, publicProcedure } from '../trpc'
import { loggedInProcedure } from '../loggedInProcedure'

export const setRouter = router({
  getAll: loggedInProcedure
    .output(Set.array())
    .query(async ({ ctx }) => {
      const setsDatabase = await getSetsByUserId(ctx.accessToken.id)
      return setsDatabase.map((set) => SetFromSetDatabase.parse(set))
    }),

  getCards: publicProcedure
    .input(Set.shape.id)
    .output(Card.array())
    .query(async ({ input: setId }) => {
      const cards = await CardCollectionRedis.fromSetId(setId)
      return await cards.toTRpcResponse()
    }),
})
