import { mysqlTable, primaryKey, varchar, boolean } from 'drizzle-orm/mysql-core'
import { User } from './User'
import { LandingPage } from './LandingPage'

export const UserCanUseLandingPage = mysqlTable('UserCanUseLandingPage', {
  user: varchar('user', { length: 64 }).notNull().references(() => User.id),
  landingPage: varchar('landingPage', { length: 36 }).notNull().references(() => LandingPage.id),
  canEdit: boolean('canEdit').notNull().default(false),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user, table.landingPage] }),
  }
})

export type UserCanUseLandingPage = typeof UserCanUseLandingPage.$inferSelect
