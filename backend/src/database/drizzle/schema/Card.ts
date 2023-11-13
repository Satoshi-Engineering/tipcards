import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'
import { Set } from './Set'

export const Card = mysqlTable('Card', {
  hash: varchar('hash', { length: 256 }).primaryKey().unique().notNull(),
  created: datetime('created').notNull(),
  set: varchar('set', { length: 256 }).references(() => Set.id),
})

export type Card = typeof Card.$inferSelect
