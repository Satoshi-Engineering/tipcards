import { TRPCError } from '@trpc/server'
import { errors } from 'jose'
import { ZodError } from 'zod'

import { validateJwt as validateJwtService } from '@backend/services/jwt.js'

import { validateAuthContext } from './validateAuthContext.js'

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
 * validate access token.
 * if the token is valid, we make sure a user with the given foreign key exists in the application database.
 * if needed, a new user is created.
 *
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
