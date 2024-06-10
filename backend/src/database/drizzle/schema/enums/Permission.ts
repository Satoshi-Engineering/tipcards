import { pgEnum } from 'drizzle-orm/pg-core'
import z from 'zod'

export const permission = pgEnum('permission', [
  'statistics', // Note: allow read access to https://tipcards.io/statistics
  'support', // Note: allow access to the support dashboard
])

export const Permission = z.enum(permission.enumValues)

export type Permission = z.infer<typeof Permission>
