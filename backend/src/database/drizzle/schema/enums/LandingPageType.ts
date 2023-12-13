import z from 'zod'

export const LANDING_PAGE_TYPES = [
  'core', // Note: landing page is integrated into tip cards core, maybe there will be multiple version to choose from in the future
  'external', // Note: user will be redirected to another page when scanning a funded card
] as const

export const LandingPageType = z.enum(LANDING_PAGE_TYPES)

export type LandingPageType = z.infer<typeof LandingPageType>
