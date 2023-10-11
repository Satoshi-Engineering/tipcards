import z from 'zod'

import { PermissionsEnum } from '../redis/User'

export const AccessTokenPayload = z.object({
  id: z.string(),
  lnurlAuthKey: z.string(),
  permissions: PermissionsEnum.array().optional(),
})

export type AccessTokenPayload = z.infer<typeof AccessTokenPayload>
