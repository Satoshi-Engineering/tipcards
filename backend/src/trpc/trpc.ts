import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { Request } from 'express'
import superjson from 'superjson'

import type { PermissionsEnum } from '@shared/data/auth/User.js'
import type { AccessTokenPayload } from '@shared/data/auth/index.js'

import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'

const getHostFromRequest = (req: Request): string | null => {
  const host = req.get('host')
  if (typeof host === 'string') {
    return host
  }
  return null
}

const getJwtFromAuthorizationHeader = (req: Request): string | null => {
  if (typeof req.headers.authorization === 'string') {
    return req.headers.authorization
  }
  return null
}

export type Context = {
  host: string | null,
  jwt: string | null,
  accessToken: AccessTokenPayload | null,
  applicationEventEmitter: ApplicationEventEmitter,
  cardLockManager: CardLockManager
}
export type Meta = {
  requiredPermissions: PermissionsEnum[],
}
export const createContext = (opts: CreateExpressContextOptions): Context => {
  return {
    host: getHostFromRequest(opts.req),
    jwt: getJwtFromAuthorizationHeader(opts.req),
    accessToken: null,
    applicationEventEmitter: ApplicationEventEmitter.instance,
    cardLockManager: CardLockManager.instance,
  }
}

const tRpc = initTRPC.context<typeof createContext>().meta<Meta>().create({
  transformer: superjson,
  defaultMeta: {
    requiredPermissions: [],
  },
})

export const router = tRpc.router
export const middleware = tRpc.middleware
export const publicProcedure = tRpc.procedure
export const createCallerFactory = tRpc.createCallerFactory
