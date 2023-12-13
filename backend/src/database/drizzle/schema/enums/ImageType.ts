import z from 'zod'

export const IMAGE_TYPES = [
  'svg',
  'png',
] as const

export const ImageType = z.enum(IMAGE_TYPES)

export type ImageType = z.infer<typeof ImageType>
