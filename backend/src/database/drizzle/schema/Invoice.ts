import { mysqlTable, int, varchar, text, datetime } from 'drizzle-orm/mysql-core'

export const Invoice = mysqlTable('Invoice', {
  amount: int('amount').notNull(),
  paymentHash: varchar('paymentHash', { length: 64 }).primaryKey().unique().notNull(), // Note: sha256 of payment preimage in hex
  paymentRequest: text('paymentRequest').notNull(),
  created: datetime('created').notNull(),
  paid: datetime('paid'),
  expiresAt: datetime('expiresAt').notNull(),
  extra: text('extra').notNull(), // Note: additional info used in lnbits, stores info like lnurlp id that created the invoice
})

export type Invoice = typeof Invoice.$inferSelect
