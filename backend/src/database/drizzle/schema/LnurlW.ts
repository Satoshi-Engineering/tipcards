import { pgTable, varchar, date } from 'drizzle-orm/pg-core'

export const LnurlW = pgTable('LnurlW', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlw link
  created: date('created', { mode: 'date' }).notNull(),
  expiresAt: date('expiresAt', { mode: 'date' }),
  withdrawn: date('withdrawn', { mode: 'date' }),
  bulkWithdrawId: varchar('bulkWithdrawId', { length: 64 }).unique(), // Note: deprecated, but needs application rework, as the application backend currently creates a bulkWithdrawId and returns it to the frontend
})

export type LnurlW = typeof LnurlW.$inferSelect
