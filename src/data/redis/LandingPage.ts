import { randomUUID } from 'crypto'
import z from 'zod'

export const createLandingPageId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export const Type = z.enum(['external'])

export type Type = z.infer<typeof Type>

export const LandingPage = z.object({
  id: z.string().describe('uuid but without hyphens (as redis search cannot process them)'),
  type: Type,
  name: z.string(),
  userId: z.string().describe('owner/creator of the image'),
  url: z.string().nullable().default(null).describe('used for type external'),
})

export type LandingPage = z.infer<typeof LandingPage>
