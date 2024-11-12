import { z } from 'zod'

export const CardsSummaryCategoriesEnum = z.enum([
  'unfunded',
  'pending',
  'funded',
  'withdrawn',
])
export type CardsSummaryCategoriesEnum = z.infer<typeof CardsSummaryCategoriesEnum>

/**
 * model for the sets list statistics
 */
export const CardsSummaryDto = z.object({
  [CardsSummaryCategoriesEnum.enum.unfunded]: z.number(),
  [CardsSummaryCategoriesEnum.enum.pending]: z.number(),
  [CardsSummaryCategoriesEnum.enum.funded]: z.number(),
  [CardsSummaryCategoriesEnum.enum.withdrawn]: z.number(),
})
export type CardsSummaryDto = z.infer<typeof CardsSummaryDto>
