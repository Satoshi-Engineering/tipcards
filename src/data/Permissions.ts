import { z } from 'zod'

export const PermissionsEnum = z.enum([
  'statistics', // allow read access to https://tipcards.io/statistics
])
