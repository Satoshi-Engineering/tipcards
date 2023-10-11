import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

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
      try {
        const setsDatabase = await getSetsByUserId(ctx.accessToken.id)
        return setsDatabase.map((set) => SetFromSetDatabase.parse(set))
      } catch (error) {
        let message = 'Unexpected database error.'
        if (error instanceof ZodError) {
          message = 'Unexpected zod parsing error.'
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message,
          cause: error,
        })
      }
    }),

  getCards: publicProcedure
    .input(Set.shape.id)
    .query(async () => {
      const cards = Card.array().parse([])
      return cards
    }),
})
