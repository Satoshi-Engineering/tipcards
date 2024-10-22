import { pgTable, index, varchar } from 'drizzle-orm/pg-core'

import { User } from './User.js'

export const AllowedSessionIds = pgTable('AllowedSessionIds', {
  user: varchar('user', { length: 64 }).notNull().references(() => User.id),
  sessionId: varchar('sessionId', { length: 36 }).primaryKey().unique().notNull(), // Note: random UUID
}, (table) => {
  return {
    sessionIdIndex: index('sessionIdIndex').on(table.sessionId),
  }
})

export type AllowedSessionIds = typeof AllowedSessionIds.$inferSelect
