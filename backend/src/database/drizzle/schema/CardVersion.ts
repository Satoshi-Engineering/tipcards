import { mysqlTable, varchar, datetime, text, boolean } from 'drizzle-orm/mysql-core'
import { Card } from './Card'
import { Invoice } from './Invoice'
import { LnurlP } from './LnurlP'
import { LnurlW } from './LnurlW'

export const CardVersion = mysqlTable('CardVersion', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  card: varchar('card', { length: 64 }).notNull().references(() => Card.hash),
  created: datetime('created').notNull(),
  invoice: varchar('invoice', { length: 64 }).references(() => Invoice.paymentHash),
  lnurlP: varchar('lnurlP', { length: 36 }).references(() => LnurlP.lnbitsId).unique(),
  lnurlW: varchar('lnurlW', { length: 36 }).references(() => LnurlW.lnbitsId),
  textForWithdraw: text('textForWithdraw').notNull(),
  noteForStatusPage: text('noteForStatusPage').notNull(),
  sharedFunding: boolean('sharedFunding').notNull(),
  landingPageViewed: datetime('landingPageViewed'),
})

export type CardVersion = typeof CardVersion.$inferSelect
