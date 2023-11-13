import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const lnurlW = mysqlTable('lnurl_ws', {
  lnbitsId: varchar('lnbitsId', { length: 256 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlw link
  created: datetime('created').notNull(),
  expiresAt: datetime('expiresAt'),
  withdrawn: datetime('withdrawn'),
})

export type LnurlW = typeof lnurlW.$inferSelect
