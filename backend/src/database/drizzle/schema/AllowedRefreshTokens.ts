import { mysqlTable, index, varchar, text } from 'drizzle-orm/mysql-core'
import { User } from './User'

export const AllowedRefreshTokens = mysqlTable('AllowedRefreshTokens', {
  hash: varchar('hash', { length: 64 }).primaryKey().unique().notNull(), // Note: sha256 of user + current + previous
  user: varchar('user', { length: 36 }).notNull().references(() => User.id),
  current: text('current').notNull(), // Note: jwt refresh token
  previous: text('previous'), // Note: jwt refresh token
}, (table) => {
  return {
    userIndex: index('userIndex').on(table.user),
  }
})

export type AllowedRefreshTokens = typeof AllowedRefreshTokens.$inferSelect
