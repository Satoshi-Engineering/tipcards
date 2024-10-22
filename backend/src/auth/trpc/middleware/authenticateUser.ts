import { middleware } from '@auth/trpc/trpc.js'

export const authenticateUser = middleware(async ({ ctx, next }) => {
  await ctx.refreshGuard.authenticateUserViaRefreshToken()
  return next({ ctx })
})
