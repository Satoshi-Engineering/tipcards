import z from 'zod'

export const Type = z.enum(['svg', 'png'])
export type Type = z.infer<typeof Type>

export const ImageDto = z.object({
  id: z.string(),
  name: z.string(),
  type: Type,
})
export type ImageDto = z.infer<typeof ImageDto>
