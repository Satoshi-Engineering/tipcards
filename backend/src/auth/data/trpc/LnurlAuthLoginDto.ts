import z from 'zod'

export const LnurlAuthLoginDto = z.object({
  lnurlAuth: z.string(),
  hash: z.string(),
})

export type LnurlAuthLoginDto = z.infer<typeof LnurlAuthLoginDto>
