import { pgTable, varchar, date, text, boolean } from 'drizzle-orm/pg-core'
import { Card } from './Card'
import { LnurlP } from './LnurlP'
import { LnurlW } from './LnurlW'

export const CardVersion = pgTable('CardVersion', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  card: varchar('card', { length: 64 }).notNull().references(() => Card.hash),
  created: date('created', { mode: 'date' }).notNull(),
  lnurlP: varchar('lnurlP', { length: 36 }).references(() => LnurlP.lnbitsId).unique(),
  lnurlW: varchar('lnurlW', { length: 36 }).references(() => LnurlW.lnbitsId),
  textForWithdraw: text('textForWithdraw').notNull(),
  noteForStatusPage: text('noteForStatusPage').notNull(),
  sharedFunding: boolean('sharedFunding').notNull(),
  landingPageViewed: date('landingPageViewed', { mode: 'date' }),
})

export type CardVersion = typeof CardVersion.$inferSelect
