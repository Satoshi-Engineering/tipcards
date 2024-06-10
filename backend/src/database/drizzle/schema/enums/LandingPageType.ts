import { pgEnum } from 'drizzle-orm/pg-core'
import z from 'zod'

export const landingPageType = pgEnum('landingPageType', [
  'core', // Note: landing page is integrated into tip cards core, maybe there will be multiple version to choose from in the future
  'external', // Note: user will be redirected to another page when scanning a funded card
])

export const LandingPageType = z.enum(landingPageType.enumValues)

export type LandingPageType = z.infer<typeof LandingPageType>
