import { TRPCError } from '@trpc/server'

import { middleware, type Context } from '../trpc.js'

/**
 * @throws TRPCError
 */
const validateAndGetRawJwt = (ctx: Context) => {
  if (ctx.jwt == null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return ctx.jwt
}

/**
 * @throws TRPCError
 */
const validateAndGetHost = (ctx: Context) => {
  if (ctx.host == null) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
  return ctx.host
}

/**
 * @throws TRPCError
 */
export const validateAuthContext = middleware(async ({ ctx, next }) => {
  const host = validateAndGetHost(ctx)
  const jwt = validateAndGetRawJwt(ctx)
  return next({
    ctx: {
      host,
      jwt,
      accessToken: ctx.accessToken,
    },
  })
})
