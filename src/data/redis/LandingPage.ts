import { randomUUID } from 'crypto'
import z from 'zod'

export const createLandingPageId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export const Type = z.enum(['external'])

export type Type = z.infer<typeof Type>

export const LandingPage = z.object({
  id: z.string(), // uuid but without hyphens (see above)
  type: Type,
  name: z.string(),
  userId: z.string(), // owner/creator of the image
  url: z.string().optional(), // used for type external
})

export type LandingPage = z.infer<typeof LandingPage>
