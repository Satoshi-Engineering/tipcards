import { randomUUID } from 'crypto'
import z from 'zod'

export const createImageId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export const Type = z.enum(['svg', 'png'])

export type Type = z.infer<typeof Type>

export const Image = z.object({
  id: z.string().describe('uuid but without hyphens (as redis search cannot process them)'),
  type: Type,
  name: z.string(),
  userId: z.string().describe('owner/creator of the image'),
})

export type Image = z.infer<typeof Image>
