import { z } from 'zod'

export const LnurlAuthLoginStatusEnum = z.enum([
  'lnurlCreated',
  'failed',
  'loggedIn',
])

export type LnurlAuthLoginStatusEnum = z.infer<typeof LnurlAuthLoginStatusEnum>
