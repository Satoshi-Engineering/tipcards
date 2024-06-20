import z from 'zod'

import { LandingPage } from './LandingPage'
import { Image } from './Image'

export const Set = z.object({
  id: z.string(),
  name: z.string().default(''),
  created: z.date().default(() => new Date()),
  changed: z.date().default(() => new Date()),
  numberOfCards: z.number().default(8),
  cardHeadline: z.string(),
  cardCopytext: z.string(),
  cardImage: Image.shape.id.nullable().default(null),
  landingPage: LandingPage.shape.id.nullable().default(null),
})
export type Set = z.infer<typeof Set>

export const SetId = z.object({
  id: Set.shape.id,
})

export type SetId = z.infer<typeof SetId>
