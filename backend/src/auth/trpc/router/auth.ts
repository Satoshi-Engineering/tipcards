import z from 'zod'

import { AccessTokenDto } from '@shared/auth/data/trpc/AccessTokenDto.js'

import { router } from '@auth/trpc/trpc.js'
import publicProcedure from '@auth/trpc/procedures/public.js'
import authenticatedUserProcedure from '@auth/trpc/procedures/authenticatedUser.js'

import {
  deleteAllRefreshTokensInDatabase,
  deleteRefreshTokenInDatabase,
} from '@backend/auth/domain/allowedRefreshTokensHelperFunctions.js'

export const authRouter = router({
  loginWithLnurlAuthHash: publicProcedure
    .input(z.object({ hash: z.string() }))
    .output(AccessTokenDto)
    .query(async ({ ctx, input }) => {
      const lnurlAuthLogin = ctx.auth.lnurlAuthLogin
      const linkingKey = lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth(input.hash)
      const authenticatedUser = await ctx.refreshGuard.loginUserWithWalletLinkingKey(linkingKey)
      await authenticatedUser.setNewRefreshTokenCookie()
      const accessToken = await authenticatedUser.createAccessToken()
      return {
        accessToken,
      }
    }),

  refreshRefreshToken: authenticatedUserProcedure
    .output(AccessTokenDto)
    .query(async ({ ctx }) => {
      await ctx.authenticatedUser.setNewRefreshTokenCookie()
      const accessToken = await ctx.authenticatedUser.createAccessToken()
      return {
        accessToken,
      }
    }),

  logout: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const authenticatedUser = await ctx.refreshGuard.authenticateUserViaRefreshToken()
        authenticatedUser.logout()
      } catch {
        // Fails silently, because user does not have to be authenticated to logout
        ctx.refreshGuard.clearRefreshTokenCookie()
      }

      const refreshTokenInCookie = ctx.refreshGuard.getRefreshTokenFromRequestCookies()
      await deleteRefreshTokenInDatabase(refreshTokenInCookie)
    }),

  logoutAllOtherDevices: authenticatedUserProcedure
    .output(AccessTokenDto)
    .query(async ({ ctx }) => {
      await ctx.authenticatedUser.setNewRefreshTokenCookie()
      await ctx.authenticatedUser.logoutAllOtherDevices()
      await deleteAllRefreshTokensInDatabase(ctx.authenticatedUser.userId)
      const accessToken = await ctx.authenticatedUser.createAccessToken()
      return {
        accessToken,
      }
    }),
})
