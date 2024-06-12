import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'

export const Set = pgTable('Set', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
  changed: timestamp('changed', { mode: 'date', withTimezone: true }).notNull(),
})

export type Set = typeof Set.$inferSelect
