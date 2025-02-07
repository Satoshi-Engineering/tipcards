import { PermissionsEnum } from '@shared/data/auth/User.js'
import { StatisticsDto } from '@shared/data/trpc/StatisticsDto.js'

import Statistics from '@backend/domain/Statistics.js'

import { router } from '../../trpc.js'
import loggedInProcedure from '../../procedures/loggedIn.js'
import { z } from 'zod'

export const statisticsRouter = router({
  getLatest: loggedInProcedure
    .input(
      z.object({
        limit: z.number(),
      })
        .default({
          limit: 500,
        }),
    )
    .output(StatisticsDto)
    .meta({ requiredPermissions: [PermissionsEnum.enum.statistics] })
    .query(async ({ input }) => {
      return await Statistics.getStatistics(input.limit)
    }),
  getFull: loggedInProcedure
    .output(StatisticsDto)
    .meta({ requiredPermissions: [PermissionsEnum.enum.statistics] })
    .query(async () => {
      return await Statistics.getStatistics()
    }),
})
