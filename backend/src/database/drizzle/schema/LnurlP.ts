import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const LnurlP = mysqlTable('LnurlP', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlp link
  created: datetime('created').notNull(),
  expiresAt: datetime('expiresAt'),
  finished: datetime('finished'), // Note: for shared funding the user has to manually trigger the finishing, for single funding this is set as soon as the first payment is registered
})

export type LnurlP = typeof LnurlP.$inferSelect
