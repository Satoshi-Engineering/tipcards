import { pgTable, primaryKey, varchar, boolean } from 'drizzle-orm/pg-core'

import { User } from './User.js'
import { LandingPage } from './LandingPage.js'

export const UserCanUseLandingPage = pgTable('UserCanUseLandingPage', {
  user: varchar('user', { length: 64 }).notNull().references(() => User.id),
  landingPage: varchar('landingPage', { length: 36 }).notNull().references(() => LandingPage.id),
  canEdit: boolean('canEdit').notNull().default(false),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user, table.landingPage] }),
  }
})

export type UserCanUseLandingPage = typeof UserCanUseLandingPage.$inferSelect
