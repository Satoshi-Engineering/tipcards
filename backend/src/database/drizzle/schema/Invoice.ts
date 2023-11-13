import { mysqlTable, int, varchar, datetime } from 'drizzle-orm/mysql-core'

export const invoice = mysqlTable('invoices', {
  amount: int('amount').notNull(),
  paymentHash: varchar('paymentHash', { length: 256 }).primaryKey().unique().notNull(),
  paymentRequest: varchar('paymentRequest', { length: 256 }).unique().notNull(),
  created: datetime('created').notNull(),
  paid: datetime('paid'),
  expiresAt: datetime('expiresAt').notNull(),
})

export type Invoice = typeof invoice.$inferSelect
