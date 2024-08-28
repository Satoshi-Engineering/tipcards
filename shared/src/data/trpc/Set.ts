import z from 'zod'

import { LandingPageDto } from './LandingPageDto.js'
import { ImageDto } from './ImageDto.js'

/**
 * deprecated as this still represents the redis data model
 * @deprecated
 */
export const Set = z.object({
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
export type Set = z.infer<typeof Set>

export const SetId = z.object({
  id: Set.shape.id,
})

export type SetId = z.infer<typeof SetId>
