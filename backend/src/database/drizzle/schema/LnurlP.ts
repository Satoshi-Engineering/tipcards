import { pgTable, varchar, date } from 'drizzle-orm/pg-core'

export const LnurlP = pgTable('LnurlP', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlp link
  created: date('created', { mode: 'date' }).notNull(),
  expiresAt: date('expiresAt', { mode: 'date' }),
  finished: date('finished', { mode: 'date' }), // Note: for shared funding the user has to manually trigger the finishing, for single funding this is set as soon as the first payment is registered
})

export type LnurlP = typeof LnurlP.$inferSelect
