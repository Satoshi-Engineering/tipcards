import z from 'zod'

import { PermissionsEnum } from '@shared/data/auth/User'
import { StatisticsPeriod } from '@shared/data/trpc/StatisticsPeriod'

import Statistics from '@backend/modules/Statistics'

import { router } from '../trpc'
import { loggedInProcedure } from '../loggedInProcedure'

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
