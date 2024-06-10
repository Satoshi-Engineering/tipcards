import { pgTable, varchar, date } from 'drizzle-orm/pg-core'

export const Set = pgTable('Set', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  created: date('created', { mode: 'date' }).notNull(),
  changed: date('changed', { mode: 'date' }).notNull(),
})

export type Set = typeof Set.$inferSelect
