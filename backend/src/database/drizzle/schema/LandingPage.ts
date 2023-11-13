import { mysqlTable, varchar, mysqlEnum, text } from 'drizzle-orm/mysql-core'

const LandingPageType: [string, ...string[]] = [
  'core', // Note: landing page is integrated into tip cards core, maybe there will be multiple version to choose from in the future
  'external', // Note: user will be redirected to another page when scanning a funded card
]

export const LandingPage = mysqlTable('LandingPage', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: mysqlEnum('type', LandingPageType).notNull(),
  name: text('name').notNull(), // Note: display name for UI
  url: text('url'), // Note: used+required for type external
})

export type LandingPage = typeof LandingPage.$inferSelect
