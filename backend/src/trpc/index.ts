import type { OnErrorFunction } from '@trpc/server/dist/internals/types'
import type { Request } from 'express'

import { router, createContext } from './trpc'
import { cardRouter } from './router/card'
import { setRouter } from './router/set'
 
export const appRouter = router({
  card: cardRouter,
  set: setRouter,
})
 
export type AppRouter = typeof appRouter

export const onError: OnErrorFunction<AppRouter, Request> = (opts) => {
  if (opts.error.code === 'INTERNAL_SERVER_ERROR') {
    console.error(opts)
  }
}

export { createContext }
