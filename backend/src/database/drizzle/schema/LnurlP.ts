import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const lnurlP = mysqlTable('lnurl_ps', {
  lnbitsId: varchar('lnbitsId', { length: 256 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlp link
  created: datetime('created').notNull(),
  expiresAt: datetime('expiresAt'),
})

export type LnurlP = typeof lnurlP.$inferSelect
