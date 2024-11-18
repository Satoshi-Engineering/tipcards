import { z } from 'zod'

export const defaultNumberOfCards = 8

export const SetSettingsDto = z.object({
  name: z.string().default(''),
  numberOfCards: z.number().default(defaultNumberOfCards),
  cardHeadline: z.string().default(''),
  cardCopytext: z.string().default(''),
  image: z.string().nullable().default(null),
  landingPage: z.string().nullable().default(null).describe('id of the landingpage'),
})
export type SetSettingsDto = z.infer<typeof SetSettingsDto>
