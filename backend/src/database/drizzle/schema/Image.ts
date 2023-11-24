import { mysqlTable, varchar, mysqlEnum, text } from 'drizzle-orm/mysql-core'
import z from 'zod'

const IMAGE_TYPES = [
  'svg',
  'png',
] as const

export const ImageType = z.enum(IMAGE_TYPES)

export type ImageType = z.infer<typeof ImageType>

export const Image = mysqlTable('Image', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: mysqlEnum('type', IMAGE_TYPES).notNull(),
  name: text('name').notNull(), // Note: display name for UI
})

export type Image = typeof Image.$inferSelect
