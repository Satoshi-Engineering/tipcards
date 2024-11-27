
import { type Context, middleware } from '@backend/trpc/trpc.js'
import User from '@backend/domain/User.js'

export const authenticateUser = middleware(async ({ ctx, meta, next }) => {
  const authenticatedUser = await ctx.accessGuard.authenticateUserViaAccessToken({
    requiredPermissions: meta?.requiredPermissions,
  })

  const loggedInContext: Context & { loggedInUser: User } = {
    ...ctx,
    loggedInUser: authenticatedUser,
  }

  return next({ ctx: loggedInContext })
})
