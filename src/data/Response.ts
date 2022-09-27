import type { ErrorCode } from './Errors'

export type SuccessResponse = {
  status: 'success'
  data: unknown
}

export type ErrorResponse = {
  status: 'error'
  message: string // a message intended for the user (but not localized)
  code: ErrorCode
  data?: unknown
}

export type LnurlErrorResponse = {
  status: 'ERROR'
  reason: string // a message intended for the user (but not localized)
  code: ErrorCode
  data?: unknown
}
