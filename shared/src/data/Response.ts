import z from 'zod'

import { ErrorCodeEnum } from './Errors.js'

export const SuccessResponse = z.object({
  status: z.literal('success'),
  data: z.unknown(),
})

export type SuccessResponse = z.infer<typeof SuccessResponse>

export const ErrorResponse = z.object({
  status: z.literal('error'),
  message: z.string().describe('a message intended for the user (but not localized)'),
  code: ErrorCodeEnum,
  data: z.unknown().optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponse>

export const LnurlErrorResponse = z.object({
  status: z.literal('ERROR'),
  reason: z.string().describe('a message intended for the user (but not localized)'),
  code: ErrorCodeEnum,
  data: z.unknown().optional(),
})

export type LnurlErrorResponse = z.infer<typeof LnurlErrorResponse>

export const AccessTokenResponse = z.object({
  status: z.literal('success'),
  data: z.object({
    accessToken: z.string(),
  }),
})

export type AccessTokenResponse = z.infer<typeof AccessTokenResponse>
