import { mysqlTable, varchar, mysqlEnum, text } from 'drizzle-orm/mysql-core'
import { LANDING_PAGE_TYPES } from './enums/LandingPageType'

export const LandingPage = mysqlTable('LandingPage', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: mysqlEnum('type', LANDING_PAGE_TYPES).notNull(),
  name: text('name').notNull(), // Note: display name for UI
  url: text('url'), // Note: used+required for type external
})

export type LandingPage = typeof LandingPage.$inferSelect
