import z from 'zod'

import { PermissionsEnum } from './User.js'
import { AccessTokenResponse } from '../Response.js'

export const AccessTokenPayload = z.object({
  userId: z.string(),
  permissions: PermissionsEnum.array().default(() => []),
  nonce: z.string().uuid().describe('this makes sure every token is unique'),
})

export type AccessTokenPayload = z.infer<typeof AccessTokenPayload>

export const AccessToken = z.string()

export type AccessToken = z.infer<typeof AccessToken>

export const AccessTokenFromResponse = AccessTokenResponse.transform((response) => AccessToken.parse(response.data.accessToken))

export type AccessTokenFromResponse = z.infer<typeof AccessTokenFromResponse>
