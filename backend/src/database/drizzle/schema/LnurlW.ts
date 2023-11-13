import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const LnurlW = mysqlTable('LnurlW', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlw link
  created: datetime('created').notNull(),
  expiresAt: datetime('expiresAt'),
  withdrawn: datetime('withdrawn'),
})

export type LnurlW = typeof LnurlW.$inferSelect
