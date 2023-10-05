import z from 'zod'

import { LandingPage } from './LandingPage'
import { Image } from './Image'

export const Set = z.object({
  id: z.string(),
  name: z.string().optional(),
  created: z.date().default(() => new Date()),
  changed: z.date().default(() => new Date()),
  numberOfCards: z.number().default(8),
  cardHeadline: z.string().optional(),
  cardCopytext: z.string().optional(),
  cardImage: Image.shape.id.optional(),
  landingPage: LandingPage.shape.id.optional(),
})
export type Set = z.infer<typeof Set>
