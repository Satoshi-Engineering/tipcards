import z from 'zod'

export const AccessTokenDto = z.object({
  accessToken: z.string(),
})

export type AccessTokenDto = z.infer<typeof AccessTokenDto>
