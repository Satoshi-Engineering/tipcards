import z from 'zod'

import { router } from '@auth/trpc/trpc.js'
import publicProcedure from '@auth/trpc/procedures/public.js'
import authenticatedUserProcedure from '@auth/trpc/procedures/authenticatedUser.js'
import { AccessTokenDto } from '@auth/data/trpc/AccessTokenDto.js'

export const authRouter = router({
  loginWithLnurlAuthHash: publicProcedure
    .input(z.object({ hash: z.string() }))
    .output(AccessTokenDto)
    .query(async ({ ctx, input }) => {
      const lnurlAuthLogin = ctx.auth.getLnurlAuthLogin()
      const linkingKey = lnurlAuthLogin.getWalletLinkingKeyAfterSuccessfulOneTimeLogin(input.hash)
      await ctx.refreshGuard.loginUserWithWalletLinkingKey(linkingKey)
      const accessToken = await ctx.refreshGuard.createAccessTokenForUser()
      return {
        accessToken,
      }
    }),

  refreshRefreshToken: authenticatedUserProcedure
    .output(AccessTokenDto)
    .query(async ({ ctx }) => {
      await ctx.refreshGuard.cycleRefreshToken()
      const accessToken = await ctx.refreshGuard.createAccessTokenForUser()
      return {
        accessToken,
      }
    }),

  logout: publicProcedure
    .query(async ({ ctx }) => {
      await ctx.refreshGuard.logout()
    }),

  logoutAllOtherDevices: authenticatedUserProcedure
    .output(AccessTokenDto)
    .query(async ({ ctx }) => {
      await ctx.refreshGuard.cycleRefreshToken()
      await ctx.refreshGuard.logoutAllOtherDevices()
      const accessToken = await ctx.refreshGuard.createAccessTokenForUser()
      return {
        accessToken,
      }
    }),
})
