import type { OnErrorFunction } from '@trpc/server/dist/internals/types'
import { TRPCError } from '@trpc/server'
import type { Request } from 'express'
import { ZodError } from 'zod'

import { ErrorWithCode } from '../../../src/data/Errors'

import NotFoundError from '../errors/NotFoundError'

import { router, createContext } from './trpc'
import { bulkWithdrawRouter } from './router/bulkWithdraw'
import { setRouter } from './router/set'
 
export const appRouter = router({
  bulkWithdraw: bulkWithdrawRouter,
  set: setRouter,
})
 
export type AppRouter = typeof appRouter

export const onError: OnErrorFunction<AppRouter, Request> = (opts) => {
  if (opts.error.cause instanceof NotFoundError) {
    opts.error = new TRPCError({
      code: 'NOT_FOUND',
      message: opts.error.cause.message,
      cause: opts.error.cause,
    })
  } else if (opts.error.cause instanceof ErrorWithCode) {
    opts.error = new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Error with code: ${opts.error.cause.code}`,
      cause: opts.error.cause.error,
    })
  } else if (opts.error.cause instanceof ZodError) {
    opts.error = new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected zod parsing error.',
      cause: opts.error.cause,
    })
  }

  if (opts.error.code === 'INTERNAL_SERVER_ERROR') {
    console.error(opts)
  }
}

export { createContext }
