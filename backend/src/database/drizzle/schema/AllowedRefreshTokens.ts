import { mysqlTable, primaryKey, varchar, text } from 'drizzle-orm/mysql-core'
import { User } from './User'

export const AllowedRefreshTokens = mysqlTable('AllowedRefreshTokens', {
  user: varchar('user', { length: 36 }).notNull().references(() => User.id),
  current: varchar('current', { length: 256 }).notNull(), // Note: 1 refresh token
  previous: text('previous').notNull(), // Note: jwt refresh token
}, (table) => {
  return {
    pk: primaryKey(table.user, table.current),
  }
})

export type AllowedRefreshTokens = typeof AllowedRefreshTokens.$inferSelect
