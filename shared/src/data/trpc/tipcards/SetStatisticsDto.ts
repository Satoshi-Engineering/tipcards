import { z } from 'zod'

export const SetStatisticsCategoriesEnum = z.enum([
  'unfunded',
  'pending',
  'funded',
  'withdrawn',
])
export type SetStatisticsCategoriesEnum = z.infer<typeof SetStatisticsCategoriesEnum>

/**
 * model for the sets list statistics
 */
export const SetStatisticsDto = z.object({
  [SetStatisticsCategoriesEnum.enum.unfunded]: z.number(),
  [SetStatisticsCategoriesEnum.enum.pending]: z.number(),
  [SetStatisticsCategoriesEnum.enum.funded]: z.number(),
  [SetStatisticsCategoriesEnum.enum.withdrawn]: z.number(),
})
export type SetStatisticsDto = z.infer<typeof SetStatisticsDto>
