import type { ErrorCode } from '@shared/data/Errors'

export default class ErrorUnauthorized extends Error {
  readonly code: ErrorCode

  constructor(code: ErrorCode, message?: string) {
    super(message)
    this.code = code
  }
}
