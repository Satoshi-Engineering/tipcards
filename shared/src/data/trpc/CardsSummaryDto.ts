import { z } from 'zod'

export const CardsSummaryCategoriesEnum = z.enum([
  'unfunded',
  'pending',
  'funded',
  'withdrawn',
])
export type CardsSummaryCategoriesEnum = z.infer<typeof CardsSummaryCategoriesEnum>

/**
 * model for the cards summary (sets list, dashboard, set details)
 */
export const CardsSummaryDto = z.object({
  [CardsSummaryCategoriesEnum.enum.unfunded]: z.object({
    count: z.number(),
    amount: z.number(),
  }),
  [CardsSummaryCategoriesEnum.enum.pending]: z.object({
    count: z.number(),
    amount: z.number(),
  }),
  [CardsSummaryCategoriesEnum.enum.funded]: z.object({
    count: z.number(),
    amount: z.number(),
  }),
  [CardsSummaryCategoriesEnum.enum.withdrawn]: z.object({
    count: z.number(),
    amount: z.number(),
  }),
})
export type CardsSummaryDto = z.infer<typeof CardsSummaryDto>
