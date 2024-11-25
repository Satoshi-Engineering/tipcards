import { z } from 'zod'

export const CardsSummaryCategoriesEnum = z.enum([
  'userActionRequired', // this status is greedy and includes all statuses that require user action, even if the cardStatus would be in another category as well
  'unfunded',
  'funded',
  'withdrawn',
])
export type CardsSummaryCategoriesEnum = z.infer<typeof CardsSummaryCategoriesEnum>

export const CardsSummaryDto = z.object({
  [CardsSummaryCategoriesEnum.enum.userActionRequired]: z.object({
    count: z.number(),
    amount: z.number(),
  }),
  [CardsSummaryCategoriesEnum.enum.unfunded]: z.object({
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
