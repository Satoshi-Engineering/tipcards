import { mysqlTable, varchar, mysqlEnum, text } from 'drizzle-orm/mysql-core'
import { IMAGE_TYPES } from './enums/ImageType'

export const Image = mysqlTable('Image', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: mysqlEnum('type', IMAGE_TYPES).notNull(),
  name: text('name').notNull(), // Note: display name for UI
  data: text('data').notNull(), // Note: image data (e.g. plaintext for svg, base64 encoded for png)
})

export type Image = typeof Image.$inferSelect
