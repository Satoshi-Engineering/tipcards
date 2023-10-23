import type { OnErrorFunction } from '@trpc/server/dist/internals/types'
import type { Request } from 'express'
import { ZodError } from 'zod'

import { ErrorWithCode } from '../../../src/data/Errors'

import NotFoundError from '../errors/NotFoundError'
import UserError from '../errors/UserError'

import { router, createContext } from './trpc'
import { bulkWithdrawRouter } from './router/bulkWithdraw'
import { cardRouter } from './router/card'
import { setRouter } from './router/set'
import { statisticsRouter } from './router/statistics'

export const appRouter = router({
  bulkWithdraw: bulkWithdrawRouter,
  card: cardRouter,
  set: setRouter,
  statistics: statisticsRouter,
})
 
export type AppRouter = typeof appRouter

export const onError: OnErrorFunction<AppRouter, Request> = (opts) => {
  if (opts.error.cause instanceof UserError) {
    (opts.error.code as string) = 'BAD_REQUEST'
    ;(opts.error.message as string) = opts.error.cause.message
  } else if (opts.error.cause instanceof NotFoundError) {
    (opts.error.code as string) = 'NOT_FOUND'
    ;(opts.error.message as string) = opts.error.cause.message
  } else if (opts.error.cause instanceof ErrorWithCode) {
    (opts.error.message as string) = `Error with code: ${opts.error.cause.code}`
    ;(opts.error.cause as unknown) = opts.error.cause.error
  } else if (opts.error.cause instanceof ZodError) {
    (opts.error.message as string) = 'Unexpected zod parsing error.'
  }

  if (opts.error.code === 'INTERNAL_SERVER_ERROR') {
    console.error(opts)
  }
}

export { createContext }
