import { pgTable, integer, varchar, text, date } from 'drizzle-orm/pg-core'

export const Invoice = pgTable('Invoice', {
  amount: integer('amount').notNull(),
  paymentHash: varchar('paymentHash', { length: 64 }).primaryKey().unique().notNull(), // Note: sha256 of payment preimage in hex
  paymentRequest: text('paymentRequest').notNull(),
  created: date('created', { mode: 'date' }).notNull(),
  paid: date('paid', { mode: 'date' }),
  expiresAt: date('expiresAt', { mode: 'date' }).notNull(),
  extra: text('extra').notNull(), // Note: additional info used in lnbits, stores info like lnurlp id that created the invoice
})

export type Invoice = typeof Invoice.$inferSelect
