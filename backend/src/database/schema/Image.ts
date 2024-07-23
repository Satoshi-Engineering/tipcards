import { pgTable, varchar, text } from 'drizzle-orm/pg-core'

import { imageType } from './enums/ImageType.js'

export const Image = pgTable('Image', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: imageType('type').notNull(),
  name: text('name').notNull(), // Note: display name for UI
  data: text('data').notNull(), // Note: image data (e.g. plaintext for svg, base64 encoded for png)
})

export type Image = typeof Image.$inferSelect
