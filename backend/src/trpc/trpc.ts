import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import superjson from 'superjson'

import type { PermissionsEnum } from '@shared/data/auth/User.js'

import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import AccessGuard from '@backend/domain/auth/AccessGuard.js'
import { getJwtValidator } from '@backend/services/jwt.js'

export type Context = {
  accessGuard: AccessGuard,
  applicationEventEmitter: ApplicationEventEmitter,
  cardLockManager: CardLockManager,
}
export type Meta = {
  requiredPermissions: PermissionsEnum[],
}
export const createContext = (opts: CreateExpressContextOptions): Context => {
  const jwtValidator = getJwtValidator()
  return {
    accessGuard: new AccessGuard({
      request: opts.req,
      jwtValidator,
    }),
    applicationEventEmitter: ApplicationEventEmitter.instance,
    cardLockManager: CardLockManager.instance,
  }
}

const tRpc = initTRPC.context<typeof createContext>().meta<Meta>().create({
  sse: {
    client: {
      reconnectAfterInactivityMs: 3_000,
    },
    ping: {
      enabled: true,
      intervalMs: 1_000,
    },
    maxDurationMs: 60_000 * 10,
  },
  transformer: superjson,
  defaultMeta: {
    requiredPermissions: [],
  },
})

export const router = tRpc.router
export const middleware = tRpc.middleware
export const publicProcedure = tRpc.procedure
export const createCallerFactory = tRpc.createCallerFactory
