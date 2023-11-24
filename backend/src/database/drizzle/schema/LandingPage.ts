import { mysqlTable, varchar, mysqlEnum, text } from 'drizzle-orm/mysql-core'
import z from 'zod'

const LANDING_PAGE_TYPES = [
  'core', // Note: landing page is integrated into tip cards core, maybe there will be multiple version to choose from in the future
  'external', // Note: user will be redirected to another page when scanning a funded card
] as const

export const LandingPageType = z.enum(LANDING_PAGE_TYPES)

export type LandingPageType = z.infer<typeof LandingPageType>

export const LandingPage = mysqlTable('LandingPage', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: mysqlEnum('type', LANDING_PAGE_TYPES).notNull(),
  name: text('name').notNull(), // Note: display name for UI
  url: text('url'), // Note: used+required for type external
})

export type LandingPage = typeof LandingPage.$inferSelect
