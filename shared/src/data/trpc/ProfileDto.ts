import z from 'zod'

export const ProfileDto = z.object({
  accountName: z.string(),
  displayName: z.string(),
  email: z.string(),
})

export type ProfileDto = z.infer<typeof ProfileDto>
