import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'

export const LnurlP = pgTable('LnurlP', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlp link
  created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'date', withTimezone: true }),
  finished: timestamp('finished', { mode: 'date', withTimezone: true }), // Note: for shared funding the user has to manually trigger the finishing, for single funding this is set as soon as the first payment is registered
})

export type LnurlP = typeof LnurlP.$inferSelect
