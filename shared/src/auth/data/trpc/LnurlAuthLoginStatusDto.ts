import { z } from 'zod'

import { LnurlAuthLoginStatusEnum } from './LnurlAuthLoginStatusEnum.js'

export const LnurlAuthLoginStatusDto = z.object({
  id: z.string(),
  status: LnurlAuthLoginStatusEnum.extract([LnurlAuthLoginStatusEnum.enum.loggedIn, LnurlAuthLoginStatusEnum.enum.failed]),
})

export type LnurlAuthLoginStatusDto = z.infer<typeof LnurlAuthLoginStatusDto>
