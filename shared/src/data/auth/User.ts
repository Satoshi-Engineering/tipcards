import { z } from 'zod'

export const PermissionsEnum = z.enum([
  'statistics', // allow read access to https://tipcards.io/statistics
  'support', // allow access to the support dashboard
])

export type PermissionsEnum = z.infer<typeof PermissionsEnum>
