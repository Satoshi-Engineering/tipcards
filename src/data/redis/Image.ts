import { randomUUID } from 'crypto'
import z from 'zod'

export const createImageId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export const Type = z.enum(['svg', 'png'])

export type Type = z.infer<typeof Type>

export const Image = z.object({
  id: z.string(), // uuid but without hyphens (see above)
  type: Type,
  name: z.string(),
  userId: z.string(), // owner/creator of the image
})

export type Image = z.infer<typeof Image>
