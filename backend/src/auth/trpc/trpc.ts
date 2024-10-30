import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import superjson from 'superjson'

import Auth from '@auth/domain/Auth.js'
import RefreshGuard from '@auth/domain/RefreshGuard.js'

export type Context = {
  auth: Auth,
  refreshGuard: RefreshGuard,
}

export type Meta = Record<string, never>

export const createContext = (opts: CreateExpressContextOptions): Context => {
  const auth = Auth.instance
  const jwtIssuer = auth.jwtIssuer
  const accessTokenAudience = auth.accessTokenAudience
  return {
    auth,
    refreshGuard: new RefreshGuard(opts.req, opts.res, jwtIssuer, accessTokenAudience),
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
