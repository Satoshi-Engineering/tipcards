import z from 'zod'

export const Type = z.enum(['external'])

export type Type = z.infer<typeof Type>

export const LandingPage = z.object({
  id: z.string().describe('uuid but without hyphens (as redis search cannot process them)'),
  type: Type,
  name: z.string(),
  userId: z.string().describe('owner/creator of the image').nullable().default(null),
  url: z.string().nullable().default(null).describe('used for type external'),
})

export type LandingPage = z.infer<typeof LandingPage>
