import { pgTable, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core'

import { Card } from './Card.js'
import { LnurlP } from './LnurlP.js'
import { LnurlW } from './LnurlW.js'

export const CardVersion = pgTable('CardVersion', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  card: varchar('card', { length: 64 }).notNull().references(() => Card.hash),
  created: timestamp('created', { mode: 'date', withTimezone: true }).notNull(),
  lnurlP: varchar('lnurlP', { length: 36 }).references(() => LnurlP.lnbitsId).unique(),
  lnurlW: varchar('lnurlW', { length: 36 }).references(() => LnurlW.lnbitsId),
  textForWithdraw: text('textForWithdraw').notNull(),
  noteForStatusPage: text('noteForStatusPage').notNull(),
  sharedFunding: boolean('sharedFunding').notNull(),
  landingPageViewed: timestamp('landingPageViewed', { mode: 'date', withTimezone: true }),
})

export type CardVersion = typeof CardVersion.$inferSelect
