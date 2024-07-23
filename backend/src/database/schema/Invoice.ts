import { pgTable, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const Invoice = pgTable('Invoice', {
  amount: integer('amount').notNull(),
  paymentHash: varchar('paymentHash', { length: 64 }).primaryKey().unique().notNull(), // Note: sha256 of payment preimage in hex
  paymentRequest: text('paymentRequest').notNull(),
  created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
  paid: timestamp('paid', { mode: 'date', withTimezone: true }),
  expiresAt: timestamp('expiresAt', { mode: 'date', withTimezone: true }).notNull(),
  extra: text('extra').notNull(), // Note: additional info used in lnbits, stores info like lnurlp id that created the invoice
})

export type Invoice = typeof Invoice.$inferSelect
