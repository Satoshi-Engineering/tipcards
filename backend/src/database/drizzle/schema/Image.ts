import { mysqlTable, varchar, mysqlEnum, text } from 'drizzle-orm/mysql-core'

const ImageType: [string, ...string[]] = [
  'svg',
  'png',
]

export const Image = mysqlTable('Image', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: mysqlEnum('type', ImageType).notNull(),
  name: text('name').notNull(), // Note: display name for UI
})

export type Image = typeof Image.$inferSelect
