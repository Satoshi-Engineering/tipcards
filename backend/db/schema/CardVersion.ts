import { mysqlTable, varchar, datetime, boolean } from 'drizzle-orm/mysql-core'
import { card } from './Card'
import { invoice } from './Invoice'
import { lnurlP } from './LnurlP'
import { lnurlW } from './LnurlW'

export const cardVersion = mysqlTable('card_versions', {
  id: varchar('id', { length: 256 }).primaryKey().unique().notNull(),
  card: varchar('card', { length: 256 }).notNull().references(() => card.hash),
  created: datetime('created').notNull(),
  invoice: varchar('invoice', { length: 256 }).references(() => invoice.paymentHash),
  lnurlP: varchar('lnurlP', { length: 256 }).references(() => lnurlP.lnbitsId).unique(),
  lnurlW: varchar('lnurlW', { length: 256 }).references(() => lnurlW.lnbitsId),
  textForWithdraw: varchar('textForWithdraw', { length: 256 }).notNull(),
  noteForStatusPage: varchar('noteForStatusPage', { length: 256 }).notNull(),
  shared: boolean('shared').notNull(),
  landingPageViewed: datetime('landingPageViewed'),
})

export type CardVersion = typeof cardVersion.$inferSelect
