import { z } from 'zod'

import { PermissionsEnum } from '@shared/data/auth/User.js'

export const Profile = z.object({
  accountName: z.string().default('').describe('for support and for the user if he has more than one accounts'),
  displayName: z.string().default('').describe('for future features where the name might be displayed'),
  email: z.string().default('').describe('email is used for account recovery only. it\'s not even validated if it belongs to the user.'),
}).default({})

export type Profile = z.infer<typeof Profile>

export const User = z.object({
  id: z.string().describe('uuid but without hyphens (as redis search cannot process them)'),
  lnurlAuthKey: z.string(),
  created: z.number().describe('unix timestamp'),
  availableCardsLogos: z.string().array().nullable().default(null).describe('list of image ids'),
  availableLandingPages: z.string().array().nullable().default(null).describe('list of landing page ids'),
  allowedRefreshTokens: z.string().array().array().nullable().default(null).describe('every device can have up to two valid refresh tokens. when creating a third via refreshing delete the first/oldest'),
  profile: Profile,
  permissions: PermissionsEnum.array().default(() => []),
})

export type User = z.infer<typeof User>
