import AuthenticatedUser from '@backend/auth/domain/AuthenticatedUser.js'

import { type Context, middleware } from '@auth/trpc/trpc.js'

export const authenticateUser = middleware(async ({ ctx, next }) => {
  const authenticatedUser = await ctx.refreshGuard.authenticateUserViaRefreshToken()
  const authContext: Context & { authenticatedUser: AuthenticatedUser } = {
    ...ctx,
    authenticatedUser,
  }

  return next({ ctx: authContext })
})
