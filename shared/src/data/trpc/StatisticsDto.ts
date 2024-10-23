import z from 'zod'

export const StatisticsPeriodDto = z.object({
  periodLabel: z.string(),
  fundingAmount: z.number(),
  fundingCount: z.number(),
  withdrawAmount: z.number(),
  withdrawCount: z.number(),
})
export type StatisticsPeriodDto = z.infer<typeof StatisticsPeriodDto>

export const StatisticsDto = z.object({
  daily: StatisticsPeriodDto.array(),
  weekly: StatisticsPeriodDto.array(),
})
export type StatisticsDto = z.infer<typeof StatisticsDto>
