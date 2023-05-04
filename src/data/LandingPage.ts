import { randomUUID } from 'crypto'

export const createLandingPageId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export enum LandingPageType {
  External = 'external', // redirect to external url
}

export type LandingPage = {
  id: string // uuid but without hyphens (see above)
  type: LandingPageType
  name: string
  userId: string // owner/creator of the landing page

  url?: string // used for type external
}
