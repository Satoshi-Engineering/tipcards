import { z } from 'zod'

import { randomUUID } from 'crypto'

export const createUserId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export const Profile = z.object({
  email: z.string().default(''), // email is used for account recovery only. it's not even validated if it belongs to the user.
}).default({})

export type Profile = z.infer<typeof Profile>

export type User = {
  id: string // uuid but without hyphens (see above)
  lnurlAuthKey: string // lnurl auth key
  created: number // unix timestamp
  availableCardsLogos?: string[] | null // list of image ids
  availableLandingPages?: string[] | null // list of landing page ids
  allowedRefreshTokens?: string[][] | null // every device can have up to two valid refresh tokens. when creating a third via refreshing delete the first/oldest
  profile?: Profile
}
