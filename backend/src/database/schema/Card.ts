import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'

import { Set } from './Set.js'

export const Card = pgTable('Card', {
  hash: varchar('hash', { length: 64 }).primaryKey().unique().notNull(), // Note: sha256 of setId + card index in hex
  created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
  set: varchar('set', { length: 36 }).references(() => Set.id),
  locked: varchar('locked', { length: 36 }).unique(), // Note: uuid, force access to cards to be serialized
})

export type Card = typeof Card.$inferSelect
