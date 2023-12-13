import { mysqlTable, varchar, text, int } from 'drizzle-orm/mysql-core'
import { Set } from './Set'
import { Image } from './Image'
import { LandingPage } from './LandingPage'

export const SetSettings = mysqlTable('SetSettings', {
  set: varchar('set', { length: 36 }).primaryKey().unique().notNull().references(() => Set.id).unique(),
  name: text('name').notNull(),
  numberOfCards: int('numberOfCards').notNull(),
  cardHeadline: text('cardHeadline').notNull(),
  cardCopytext: text('cardCopytext').notNull(),
  image: varchar('image', { length: 36 }).notNull().references(() => Image.id),
  landingPage: varchar('landingPage', { length: 36 }).notNull().references(() => LandingPage.id),
})

export type SetSettings = typeof SetSettings.$inferSelect
