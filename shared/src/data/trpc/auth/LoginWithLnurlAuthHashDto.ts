import z from 'zod'

export const LoginWithLnurlAuthHashDto = z.object({
  accessToken: z.string(),
})

export type LoginWithLnurlAuthHashDto = z.infer<typeof LoginWithLnurlAuthHashDto>
