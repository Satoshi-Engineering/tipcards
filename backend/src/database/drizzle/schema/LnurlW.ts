import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const LnurlW = mysqlTable('LnurlW', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlw link
  created: datetime('created').notNull(),
  expiresAt: datetime('expiresAt'),
  withdrawn: datetime('withdrawn'),
  bulkWithdrawId: varchar('bulkWithdrawId', { length: 64 }).unique(), // Note: deprecated, but needs application rework, as the application backend currently creates a bulkWithdrawId and returns it to the frontend
})

export type LnurlW = typeof LnurlW.$inferSelect
