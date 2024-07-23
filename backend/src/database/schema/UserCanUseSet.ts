import { pgTable, primaryKey, varchar, boolean } from 'drizzle-orm/pg-core'

import { User } from './User.js'
import { Set } from './Set.js'

export const UserCanUseSet = pgTable('UserCanUseSet', {
  user: varchar('user', { length: 64 }).notNull().references(() => User.id),
  set: varchar('set', { length: 36 }).notNull().references(() => Set.id),
  canEdit: boolean('canEdit').notNull().default(false),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user, table.set] }),
  }
})

export type UserCanUseSet = typeof UserCanUseSet.$inferSelect
