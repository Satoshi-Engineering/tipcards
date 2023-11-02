import z from 'zod'

import { PermissionsEnum } from '@shared/data/redis/User'

import { StatisticsPeriod } from '../data/StatisticsPeriod'
import { router } from '../trpc'
import { loggedInProcedure } from '../loggedInProcedure'
import Statistics from '@backend/modules/Statistics'

export const statisticsRouter = router({
  getFull: loggedInProcedure
    .output(z.object({
      daily: StatisticsPeriod.array(),
      weekly: StatisticsPeriod.array(),
    }))
    .meta({ requiredPermissions: [PermissionsEnum.enum.statistics] })
    .query(async () => {
      return await Statistics.getStatistics()
    }),
})
