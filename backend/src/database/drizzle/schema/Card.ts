import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'
import { Set } from './Set'

export const Card = mysqlTable('Card', {
  hash: varchar('hash', { length: 64 }).primaryKey().unique().notNull(), // Note: sha256 of setId + card index in hex
  created: datetime('created').notNull(),
  set: varchar('set', { length: 36 }).references(() => Set.id),
})

export type Card = typeof Card.$inferSelect
