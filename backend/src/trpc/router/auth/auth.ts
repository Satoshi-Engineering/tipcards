import { AuthCreateDto } from '@shared/data/trpc/auth/AuthCreateDto.js'

import Auth from '@backend/domain/auth/Auth.js'

import { router } from '../../trpc.js'
import publicProcedure from '../../procedures/public.js'

export const authRouter = router({
  create: publicProcedure
    .output(AuthCreateDto)
    .query(async () => {
      const lnurlAuth = await Auth.createLnUrlAuth()
      return lnurlAuth
    }),
})
