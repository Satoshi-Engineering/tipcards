import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import superjson from 'superjson'

import Auth from '@backend/domain/auth/Auth.js'
import AuthSession from '../AuthSession.js'

export type Context = {
  auth: Auth,
  session: AuthSession,
}

export type Meta = Record<string, never>

export const createContext = (opts: CreateExpressContextOptions): Context => {
  return {
    auth: Auth.getAuth(),
    session: new AuthSession(opts.req, opts.res),
  }
}

const tRpc = initTRPC.context<typeof createContext>().meta<Meta>().create({
  transformer: superjson,
  defaultMeta: {
  },
})

export const router = tRpc.router
export const middleware = tRpc.middleware
export const publicProcedure = tRpc.procedure
export const createCallerFactory = tRpc.createCallerFactory
