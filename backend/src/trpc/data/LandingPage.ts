import { z } from 'zod'

export const Type = z.enum(['external'])
export type Type = z.infer<typeof Type>

export const LandingPage = z.object({
  id: z.string(),
  name: z.string(),
  type: Type,
  url: z.string().nullable().default(null).describe('used for type external'),
})
export type LandingPage = z.infer<typeof LandingPage>
