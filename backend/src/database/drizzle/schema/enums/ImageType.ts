import { pgEnum } from 'drizzle-orm/pg-core'
import z from 'zod'

export const imageType = pgEnum('imageType', [
  'svg',
  'png',
])

export const ImageType = z.enum(imageType.enumValues)

export type ImageType = z.infer<typeof ImageType>
