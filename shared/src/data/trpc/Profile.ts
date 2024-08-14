import z from 'zod'

export const Profile = z.object({
  accountName: z.string(),
  displayName: z.string(),
  email: z.string(),
})

export type Profile = z.infer<typeof Profile>
