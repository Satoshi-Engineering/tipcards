import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const LnurlP = mysqlTable('LnurlP', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlp link
  created: datetime('created').notNull(),
  expiresAt: datetime('expiresAt'),
})

export type LnurlP = typeof LnurlP.$inferSelect
