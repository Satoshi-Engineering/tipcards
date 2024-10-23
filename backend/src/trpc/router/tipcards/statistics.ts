import { PermissionsEnum } from '@shared/data/auth/User.js'
import { StatisticsDto } from '@shared/data/trpc/StatisticsDto.js'

import Statistics from '@backend/domain/Statistics.js'

import { router } from '../../trpc.js'
import loggedInProcedure from '../../procedures/loggedIn.js'

export const statisticsRouter = router({
  getFull: loggedInProcedure
    .output(StatisticsDto)
    .meta({ requiredPermissions: [PermissionsEnum.enum.statistics] })
    .query(async () => {
      return await Statistics.getStatistics()
    }),
})
