import z from 'zod'

import { LnurlAuthLoginStatusEnum } from './LnurlAuthLoginStatusEnum.js'

export const LnurlAuthLoginDto = z.object({
  id: z.string(),
  lnurlAuth: z.string(),
  hash: z.string(),
  status: LnurlAuthLoginStatusEnum.extract([LnurlAuthLoginStatusEnum.enum.lnurlCreated]),
})

export type LnurlAuthLoginDto = z.infer<typeof LnurlAuthLoginDto>
