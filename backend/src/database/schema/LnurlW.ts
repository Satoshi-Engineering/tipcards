import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'

export const LnurlW = pgTable('LnurlW', {
  lnbitsId: varchar('lnbitsId', { length: 36 }).primaryKey().unique().notNull(), // Note: id from lnbits lnurlw link
  created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'date', withTimezone: true }),
  withdrawn: timestamp('withdrawn', { mode: 'date', withTimezone: true }),
  bulkWithdrawId: varchar('bulkWithdrawId', { length: 64 }).unique(), // Note: deprecated, but needs application rework, as the application backend currently creates a bulkWithdrawId and returns it to the frontend
})

export type LnurlW = typeof LnurlW.$inferSelect
