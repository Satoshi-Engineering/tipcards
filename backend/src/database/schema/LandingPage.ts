import { pgTable, varchar, text } from 'drizzle-orm/pg-core'

import { landingPageType } from './enums/LandingPageType.js'

export const LandingPage = pgTable('LandingPage', {
  id: varchar('id', { length: 36 }).primaryKey().unique().notNull(), // Note: uuid
  type: landingPageType('type').notNull(),
  name: text('name').notNull(), // Note: display name for UI
  url: text('url'), // Note: used+required for type external
})

export type LandingPage = typeof LandingPage.$inferSelect
