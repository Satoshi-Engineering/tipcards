import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'
import { set } from './Set'

export const card = mysqlTable('cards', {
  hash: varchar('hash', { length: 256 }).primaryKey().unique().notNull(),
  created: datetime('created').notNull(),
  set: varchar('card', { length: 256 }).references(() => set.id),
})

export type Card = typeof card.$inferSelect; // return type when queried
