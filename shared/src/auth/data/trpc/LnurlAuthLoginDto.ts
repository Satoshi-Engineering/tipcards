// TODO : move to shared

import z from 'zod'

export const LnurlAuthLoginStatusEnum = z.enum([
  'lnurlCreated',
  'failed',
  'loggedIn',
])

export type LnurlAuthLoginStatusEnum = z.infer<typeof LnurlAuthLoginStatusEnum>

export const LnurlAuthLoginDto = z.object({
  lnurlAuth: z.string(),
  hash: z.string().optional(),
  status: LnurlAuthLoginStatusEnum,
})

export type LnurlAuthLoginDto = z.infer<typeof LnurlAuthLoginDto>
