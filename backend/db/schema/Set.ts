import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const set = mysqlTable('sets', {
  id: varchar('id', { length: 256 }).primaryKey().unique(),
  created: datetime('created').notNull(),
  changed: datetime('changed').notNull(),
})

export type Set = typeof set.$inferSelect; // return type when queried
