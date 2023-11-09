import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const set = mysqlTable('cities', {
  id: varchar('id', { length: 256 }).primaryKey().unique(),
  created: timestamp('created').notNull(),
  changed: timestamp('created').notNull(),
})

export type Set = typeof set.$inferSelect; // return type when queried
