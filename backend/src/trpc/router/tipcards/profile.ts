import { ProfileDto } from '@shared/data/trpc/ProfileDto.js'

import Profile from '@backend/domain/Profile.js'

import { router } from '../../trpc.js'
import loggedInProcedure from '../../procedures/loggedIn.js'

export const profileRouter = router({
  get: loggedInProcedure
    .output(ProfileDto)
    .query(async ({ ctx }) => {
      const profile = await Profile.fromUserIdOrDefault(ctx.loggedInUser.id)
      return profile.toTRpcResponse()
    }),

  update: loggedInProcedure
    .input(ProfileDto.partial())
    .output(ProfileDto)
    .mutation(async ({ ctx, input }) => {
      const profile = await Profile.fromUserIdOrDefault(ctx.loggedInUser.id)
      await profile.update(input)
      return profile.toTRpcResponse()
    }),

  getDisplayName: loggedInProcedure
    .output(ProfileDto.shape.displayName)
    .query(async ({ ctx }) => {
      const profile = await Profile.fromUserIdOrDefault(ctx.loggedInUser.id)
      return profile.toTRpcResponse().displayName
    }),
})
