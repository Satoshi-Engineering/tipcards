import { mysqlTable, varchar, datetime, boolean } from 'drizzle-orm/mysql-core'
import { Card } from './Card'
import { Invoice } from './Invoice'
import { LnurlP } from './LnurlP'
import { LnurlW } from './LnurlW'

export const CardVersion = mysqlTable('CardVersion', {
  id: varchar('id', { length: 256 }).primaryKey().unique().notNull(),
  card: varchar('card', { length: 256 }).notNull().references(() => Card.hash),
  created: datetime('created').notNull(),
  invoice: varchar('invoice', { length: 256 }).references(() => Invoice.paymentHash),
  lnurlP: varchar('lnurlP', { length: 256 }).references(() => LnurlP.lnbitsId).unique(),
  lnurlW: varchar('lnurlW', { length: 256 }).references(() => LnurlW.lnbitsId),
  textForWithdraw: varchar('textForWithdraw', { length: 256 }).notNull(),
  noteForStatusPage: varchar('noteForStatusPage', { length: 256 }).notNull(),
  shared: boolean('shared').notNull(),
  landingPageViewed: datetime('landingPageViewed'),
})

export type CardVersion = typeof CardVersion.$inferSelect
