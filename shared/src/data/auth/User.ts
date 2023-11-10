import { z } from 'zod'

export const PermissionsEnum = z.enum([
  'statistics', // allow read access to https://tipcards.io/statistics
  'support', // allow access to the support dashboard
])

export type PermissionsEnum = z.infer<typeof PermissionsEnum>

export const Profile = z.object({
  accountName: z.string().default('').describe('for support and for the user if he has more than one accounts'),
  displayName: z.string().default('').describe('for future features where the name might be displayed'),
  email: z.string().default('').describe('email is used for account recovery only. it\'s not even validated if it belongs to the user.'),
}).default({})

export type Profile = z.infer<typeof Profile>
