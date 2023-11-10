import z from 'zod'

export const StatisticsPeriod = z.object({
  periodLabel: z.string(),
  fundingAmount: z.number(),
  fundingCount: z.number(),
  withdrawAmount: z.number(),
  withdrawCount: z.number(),
})
export type StatisticsPeriod = z.infer<typeof StatisticsPeriod>
