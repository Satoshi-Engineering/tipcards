import { LnurlAuthLoginDto } from '@shared/data/trpc/auth/LnurlAuthLoginDto.js'

import { router } from '@backend/auth/trpc/trpc.js'
import publicProcedure from '@backend/auth/trpc/procedures/public.js'
import Auth from '@backend/auth/domain/Auth.js'

export const lnurlAuthRouter = router({
  create: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      return await Auth.getAuth().getLnurlAuthLogin().create()
    }),
})
