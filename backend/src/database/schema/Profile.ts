import { pgTable, varchar, text } from 'drizzle-orm/pg-core'

import { User } from './User.js'

export const Profile = pgTable('Profile', {
  user: varchar('user', { length: 64 }).primaryKey().unique().notNull().references(() => User.id).unique(),
  accountName: text('accountName').notNull(), // Note: for support and for the user if he has more than one account
  displayName: text('displayName').notNull(), // Note: for future features where the name might be displayed
  email: text('email').notNull(), // Note: email is used for account recovery only. it's not even validated as it belongs to the user
})

export type Profile = typeof Profile.$inferSelect
