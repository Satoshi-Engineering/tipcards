import z from 'zod'

export const AuthCreateDto = z.object({
  lnurl: z.string(),
  hash: z.string(),
})

export type AuthCreateDto = z.infer<typeof AuthCreateDto>
