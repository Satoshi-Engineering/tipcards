import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import { validateJwt } from '../services/jwt'
import { middleware, publicProcedure, type Context } from './trpc'

/**
 * @throws TRPCError
 */
const validateAndGetRawJwt = (ctx: Context) => {
  if (ctx.jwt == null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return ctx.jwt
}

const validateAndGetHost = (ctx: Context) => {
  if (ctx.host == null) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
  return ctx.host
}

const mapErrorToTRpcError = (error: unknown) => {
  let message = 'Invalid authorization token.'
  let code: 'UNAUTHORIZED' | 'INTERNAL_SERVER_ERROR' = 'UNAUTHORIZED'
  if (error instanceof ZodError) {
    message = 'JWT payload parsing failed.'
    code = 'INTERNAL_SERVER_ERROR'
  }
  return new TRPCError({ message, code })
}

/**
 * @throws TRPCError
 */
const validateJwtMiddleware = middleware(async ({ ctx, next }) => {
  const host = validateAndGetHost(ctx)
  const jwt = validateAndGetRawJwt(ctx)
  try {
    const accessToken = await validateJwt(jwt, host)
    return next({
      ctx: {
        host,
        jwt,
        accessToken,
      },
    })
  } catch (error) {
    throw mapErrorToTRpcError(error)
  }
})

export const loggedInProcedure = publicProcedure.use(validateJwtMiddleware)
