import z from 'zod'

// ENUM: Permission

const PERMISSIONS = [
  'statistics', // Note: allow read access to https://tipcards.io/statistics
  'support', // Note: allow access to the support dashboard
] as const

export const Permission = z.enum(PERMISSIONS)

export type Permission = z.infer<typeof Permission>
