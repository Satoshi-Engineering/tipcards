import z from 'zod'

import { PermissionsEnum } from '@shared/data/auth/User.js'
import { StatisticsPeriod } from '@shared/data/trpc/StatisticsPeriod.js'

import Statistics from '@backend/modules/Statistics.js'

import { router } from '../trpc.js'
import loggedInProcedure from '../procedures/loggedIn.js'

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
