import { z } from 'zod'

export const Profile = z.object({
  accountName: z.string().default(''), // for support and for the user if he has more than one accounts
  displayName: z.string().default(''), // for future features where the name might be displayed
  email: z.string().default(''), // email is used for account recovery only. it's not even validated if it belongs to the user.
}).default({})

export type Profile = z.infer<typeof Profile>

export const PermissionsEnum = z.enum([
  'statistics', // allow read access to https://tipcards.io/statistics
  'support', // allow access to the support dashboard
])

export type PermissionsEnum = z.infer<typeof PermissionsEnum>

export const User = z.object({
  id: z.string(), // uuid but without hyphens (see above)
  lnurlAuthKey: z.string(), // lnurl auth key
  created: z.number(), // unix timestamp
  availableCardsLogos: z.string().array().nullable().optional(), // list of image ids
  availableLandingPages: z.string().array().nullable().optional(), // list of landing page ids
  allowedRefreshTokens: z.string().array().array().nullable().optional(), // every device can have up to two valid refresh tokens. when creating a third via refreshing delete the first/oldest
  profile: Profile.optional(),
  permissions: PermissionsEnum.array().optional(),
})

export type User = z.infer<typeof User>
