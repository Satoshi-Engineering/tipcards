import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const Set = mysqlTable('Set', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  created: datetime('created').notNull(),
  changed: datetime('changed').notNull(),
})

export type Set = typeof Set.$inferSelect
