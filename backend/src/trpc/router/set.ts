import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import { ErrorWithCode } from '../../../../src/data/Errors'

import CardCollectionRedis from '../../modules/CardCollectionRedis'
import { getSetsByUserId } from '../../services/database'

import { SetFromSetDatabase } from '../data/transforms/SetFromSetDatabase'
import { Card } from '../data/Card'
import { Set } from '../data/Set'
import { router, publicProcedure } from '../trpc'
import { loggedInProcedure } from '../loggedInProcedure'

// todo : check if I can use middleware for try/catch and "generic" error handling
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
    .output(Card.array())
    .query(async ({ input: setId }) => {
      try {
        const cards = await CardCollectionRedis.fromSetId(setId)
        return await cards.toTRpcResponse()
      } catch (error) {
        let message = 'Unexpected database error.'
        let cause = error
        if (error instanceof ErrorWithCode) {
          message = `Error with code: ${error.code}`
          cause = error.error
        } if (error instanceof ZodError) {
          message = 'Unexpected zod parsing error.'
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message,
          cause,
        })
      }
    }),
})
