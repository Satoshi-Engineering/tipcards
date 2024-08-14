import { Profile as ProfileDto } from '@shared/data/trpc/Profile.js'

import Profile from '@backend/modules/Profile.js'

import { router } from '../trpc.js'
import loggedInProcedure from '../procedures/loggedIn.js'

export const profileRouter = router({
  getDisplayName: loggedInProcedure
    .output(ProfileDto.shape.displayName)
    .query(async ({ ctx }) => {
      const profile = await Profile.fromUserIdOrDefault(ctx.accessToken.id)
      return profile.toTRpcResponse().displayName
    }),
})
