import AuthenticatedUser from '@backend/auth/domain/AuthenticatedUser.js'

import { ErrorWithCode } from '@shared/data/Errors.js'

import { type Context, middleware } from '@auth/trpc/trpc.js'
import { isUnauthorizedError } from '@auth/trpc/errorHandling.js'

export const authenticateUser = middleware(async ({ ctx, next }) => {
  let authenticatedUser
  try {
    authenticatedUser = await ctx.refreshGuard.authenticateUserViaRefreshToken()
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      if (isUnauthorizedError(error)) {
        ctx.refreshGuard.clearRefreshTokenCookie()
      }
    }
    throw error
  }

  const authContext: Context & { authenticatedUser: AuthenticatedUser } = {
    ...ctx,
    authenticatedUser,
  }

  return next({ ctx: authContext })
})
