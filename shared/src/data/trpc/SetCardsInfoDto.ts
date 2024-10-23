import { z } from 'zod'

export const SetCardsInfoCategoriesEnum = z.enum([
  'unfunded',
  'pending',
  'funded',
  'withdrawn',
])
export type SetCardsInfoCategoriesEnum = z.infer<typeof SetCardsInfoCategoriesEnum>

/**
 * model for the sets list statistics
 */
export const SetCardsInfoDto = z.object({
  [SetCardsInfoCategoriesEnum.enum.unfunded]: z.number(),
  [SetCardsInfoCategoriesEnum.enum.pending]: z.number(),
  [SetCardsInfoCategoriesEnum.enum.funded]: z.number(),
  [SetCardsInfoCategoriesEnum.enum.withdrawn]: z.number(),
})
export type SetCardsInfoDto = z.infer<typeof SetCardsInfoDto>
