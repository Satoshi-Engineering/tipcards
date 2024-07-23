import { pgTable, varchar, text, integer } from 'drizzle-orm/pg-core'

import { Set } from './Set.js'
import { Image } from './Image.js'
import { LandingPage } from './LandingPage.js'

export const SetSettings = pgTable('SetSettings', {
  set: varchar('set', { length: 36 }).primaryKey().unique().notNull().references(() => Set.id).unique(),
  name: text('name').notNull(),
  numberOfCards: integer('numberOfCards').notNull(),
  cardHeadline: text('cardHeadline').notNull(),
  cardCopytext: text('cardCopytext').notNull(),
  image: varchar('image', { length: 36 }).references(() => Image.id),
  landingPage: varchar('landingPage', { length: 36 }).notNull().references(() => LandingPage.id),
})

export type SetSettings = typeof SetSettings.$inferSelect
