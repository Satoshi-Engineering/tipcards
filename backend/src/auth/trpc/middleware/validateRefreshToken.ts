import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import { errors } from 'jose'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import { middleware } from '@auth/trpc/trpc.js'

const mapErrorToTRpcError = (error: unknown) => {
  let cause = error
  let message = 'Invalid authorization token.'
  let code: 'UNAUTHORIZED' | 'INTERNAL_SERVER_ERROR' = 'UNAUTHORIZED'
  if (error instanceof errors.JWTExpired) {
    cause = new ErrorWithCode('JWTExpired - Authorization expired', ErrorCode.RefreshTokenExpired)
  } else if (error instanceof ZodError) {
    message = `ZodError - JWT payload parsing failed - ${error.message}`
    code = 'INTERNAL_SERVER_ERROR'
  } else if (error instanceof ErrorWithCode) {
    if (error.code === ErrorCode.UnknownDatabaseError) {
      code = 'INTERNAL_SERVER_ERROR'
    }
    if (error.code === ErrorCode.UnableToUpdateUser) {
      code = 'INTERNAL_SERVER_ERROR'
    }
  }

  return new TRPCError({ message, code, cause })
}

export const validateRefreshToken = middleware(async ({ ctx, next }) => {
  try {
    await ctx.refreshGuard.validateRefreshToken()
    return next({ ctx })
  } catch (error) {
    throw mapErrorToTRpcError(error)
  }
})
