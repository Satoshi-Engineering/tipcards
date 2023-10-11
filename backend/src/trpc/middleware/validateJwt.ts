import { TRPCError } from '@trpc/server'
import { errors } from 'jose'
import { ZodError } from 'zod'

import { validateJwt as validateJwtService } from '../../services/jwt'
import { validateAuthContext } from './validateAuthContext'

const mapErrorToTRpcError = (error: unknown) => {
  let message = 'Invalid authorization token.'
  let code: 'UNAUTHORIZED' | 'INTERNAL_SERVER_ERROR' = 'UNAUTHORIZED'
  if (error instanceof errors.JWTExpired) {
    message = 'Authorization expired.'
  } else if (error instanceof ZodError) {
    message = 'JWT payload parsing failed.'
    code = 'INTERNAL_SERVER_ERROR'
  }
  return new TRPCError({ message, code })
}

/**
 * @throws TRPCError
 */
export const validateJwt = validateAuthContext.unstable_pipe(async ({ ctx, next }) => {
  try {
    const accessToken = await validateJwtService(ctx.jwt, ctx.host)
    return next({
      ctx: {
        host: ctx.host,
        jwt: ctx.jwt,
        accessToken,
      },
    })
  } catch (error) {
    throw mapErrorToTRpcError(error)
  }
})
