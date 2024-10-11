import z from 'zod'

import { AccessTokenDto } from '@shared/data/trpc/auth/AccessTokenDto.js'

import { router } from '../trpc.js'
import publicProcedure from '../procedures/public.js'
import validRefreshTokenProcedure from '../procedures/validRefreshToken.js'

export const authRouter = router({
  loginWithLnurlAuthHash: publicProcedure
    .input(z.object({ hash: z.string() }))
    .output(AccessTokenDto)
    .query(async ({ ctx, input }) => {
      const walletPublicKey = ctx.auth.getLnurlAuthLogin().getAuthenticatedWalletPublicKey(input.hash)
      await ctx.refreshGuard.loginWithWalletPublicKey(walletPublicKey)
      const accessToken = await ctx.refreshGuard.createAuthorizationToken()
      return {
        accessToken,
      }
    }),

  refreshRefreshToken: validRefreshTokenProcedure
    .output(AccessTokenDto)
    .query(async ({ ctx }) => {
      await ctx.refreshGuard.cycleRefreshToken()
      const accessToken = await ctx.refreshGuard.createAuthorizationToken()
      return {
        accessToken,
      }
    }),

  logout: publicProcedure
    .query(async ({ ctx }) => {
      await ctx.refreshGuard.logout()
    }),

  logoutAllOtherDevices: validRefreshTokenProcedure
    .output(AccessTokenDto)
    .query(async ({ ctx }) => {
      await ctx.refreshGuard.cycleRefreshToken()
      await ctx.refreshGuard.logoutAllOtherDevices()
      const accessToken = await ctx.refreshGuard.createAuthorizationToken()
      return {
        accessToken,
      }
    }),
})
