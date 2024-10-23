import z from 'zod'

import { LandingPageDto } from './LandingPageDto.js'
import { ImageDto } from './ImageDto.js'

/**
 * deprecated as this still represents the redis data model
 * @deprecated
 */
export const SetDeprecated = z.object({
  id: z.string(),
  name: z.string().default(''),
  created: z.date().default(() => new Date()),
  changed: z.date().default(() => new Date()),
  numberOfCards: z.number().default(8),
  cardHeadline: z.string(),
  cardCopytext: z.string(),
  cardImage: ImageDto.shape.id.nullable().default(null),
  landingPage: LandingPageDto.shape.id.nullable().default(null),
})
export type SetDeprecated = z.infer<typeof SetDeprecated>

export const SetDeprecatedId = z.object({
  id: SetDeprecated.shape.id,
})

export type SetDeprecatedId = z.infer<typeof SetDeprecatedId>
