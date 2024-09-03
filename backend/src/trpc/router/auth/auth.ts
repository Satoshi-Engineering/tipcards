import { LnurlAuthLoginDto } from '@shared/data/trpc/auth/LnurlAuthLoginDto.js'

import Auth from '@backend/domain/auth/Auth.js'

import { router } from '../../trpc.js'
import publicProcedure from '../../procedures/public.js'

export const authRouter = router({
  createLnurlAuthLogin: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      const lnurlAuth = await Auth.createLnUrlAuth()
      return lnurlAuth
    }),
})
