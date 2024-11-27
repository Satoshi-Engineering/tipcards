import z from 'zod'

import { PermissionsEnum } from './User.js'

export const AccessTokenPayload = z.object({
  userId: z.string(),
  permissions: PermissionsEnum.array().default(() => []),
  nonce: z.string().uuid().describe('this makes sure every token is unique'),
})

export type AccessTokenPayload = z.infer<typeof AccessTokenPayload>

export const AccessToken = z.string()

export type AccessToken = z.infer<typeof AccessToken>
