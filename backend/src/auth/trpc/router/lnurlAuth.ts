import { LnurlAuthLoginDto } from '@shared/data/trpc/auth/LnurlAuthLoginDto.js'

import { router } from '@auth/trpc/trpc.js'
import publicProcedure from '@auth/trpc/procedures/public.js'
import Auth from '@auth/domain/Auth.js'

export const lnurlAuthRouter = router({
  create: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      return await Auth.getAuth().getLnurlAuthLogin().create()
    }),
})
