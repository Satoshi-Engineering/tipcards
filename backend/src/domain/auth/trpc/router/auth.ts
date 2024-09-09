import z from 'zod'

import { LoginWithLnurlAuthHashDto } from '@shared/data/trpc/auth/LoginWithLnurlAuthHashDto.js'

import { router } from '../trpc.js'
import publicProcedure from '../procedures/public.js'

export const authRouter = router({
  loginWithLnurlAuthHash: publicProcedure
    .input(z.object({ hash: z.string() }))
    .output(LoginWithLnurlAuthHashDto)
    .query(async ({ ctx, input }) => {
      const result = await ctx.auth.loginWithLnurlAuthHash(input.hash)
      ctx.session.setRefreshCookie(result.refreshToken)
      return {
        accessToken: result.accessToken,
      }
    }),
})
