import { LnurlAuthLoginDto } from '@shared/data/trpc/auth/LnurlAuthLoginDto.js'

import { router } from '../trpc.js'
import publicProcedure from '../procedures/public.js'
import Auth from '@backend/domain/auth/Auth.js'

export const lnurlAuthRouter = router({
  create: publicProcedure
    .output(LnurlAuthLoginDto)
    .query(async () => {
      return await Auth.getAuth().getLnurlAuthLogin().create()
    }),
})
