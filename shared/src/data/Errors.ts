import z from 'zod'

export enum ErrorCode {
  UnknownDatabaseError = 'UnknownDatabaseError',
  CardByHashNotFound = 'CardByHashNotFound',
  CardNotFunded = 'CardNotFunded',
  UnableToGetLnurl = 'UnableToGetLnurl',
  WithdrawIdNotFound = 'WithdrawIdNotFound',
  UnableToResolveLnbitsLnurl = 'UnableToResolveLnbitsLnurl',
  UnableToCreateLnbitsInvoice = 'UnableToCreateLnbitsInvoice',
  UnableToGetLnbitsInvoiceStatus = 'UnableToGetLnbitsInvoiceStatus',
  UnableToCreateLnbitsWithdrawLink = 'UnableToCreateLnbitsWithdrawLink',
  UnknownErrorWhileCheckingInvoiceStatus = 'UnknownErrorWhileCheckingInvoiceStatus',
  UnableToGetLnbitsWithdrawStatus = 'UnableToGetLnbitsWithdrawStatus',
  UnknownErrorWhileCheckingWithdrawStatus = 'UnknownErrorWhileCheckingWithdrawStatus',
  WithdrawHasBeenSpent = 'WithdrawHasBeenSpent',
  CardFundedAndNotUsed = 'CardFundedAndNotUsed',
  UnableToCreateLnurlP = 'UnableToCreateLnurlP',
  UnableToGetLnurlP = 'UnableToGetLnurlP',
  UnableToGetLnbitsLnurlpStatus = 'UnableToGetLnbitsLnurlpStatus',
  UnableToGetLnbitsPaymentRequests = 'UnableToGetLnbitsPaymentRequests',
  UnableToRemoveLnurlpLink = 'UnableToRemoveLnurlpLink',
  SetNotFound = 'SetNotFound',
  UnknownErrorWhileCheckingSetInvoiceStatus = 'UnknownErrorWhileCheckingSetInvoiceStatus',
  CannotDeleteFundedSet = 'CannotDeleteFundedSet',
  CardNeedsSetFunding = 'CardNeedsSetFunding',
  CannotCreateLnurlPCardHasInvoice = 'CannotCreateLnurlPCardHasInvoice',
  InvalidInput = 'InvalidInput',
  SetBelongsToAnotherUser = 'SetBelongsToAnotherUser',
  SetAlreadyFunded = 'SetAlreadyFunded',
  SetInvoiceAlreadyExists = 'SetInvoiceAlreadyExists',
  CardLogoNotFound = 'CardLogoNotFound',
  LnurlpTooManyPaymentRequests = 'LnurlpTooManyPaymentRequests',
  LnbitsPaymentRequestsMalformedResponse = 'LnbitsPaymentRequestsMalformedResponse',
  LnbitsLnurlpPaymentsNotFound = 'LnbitsLnurlpPaymentsNotFound',
  TooManySetsForUser = 'TooManySetsForUser',
  FoundMultipleUsersForLnurlAuthKey = 'FoundMultipleUsersForLnurlAuthKey',
  UnableToGetAllUsers = 'UnableToGetAllUsers',
  PermissionsMissing = 'PermissionsMissing',
  UnableToParseEnvVar = 'UnableToParseEnvVar',
  UnableToGetLnbitsBulkWithdrawStatus = 'UnableToGetLnbitsBulkWithdrawStatus',
  UnableToParseLnbitsPaymentsForCardPaymentInfo = 'UnableToParseLnbitsPaymentsForCardPaymentInfo',
  UnableToGetOrCreateUserByLnurlAuthKey = 'UnableToGetOrCreateUserByLnurlAuthKey',
  UnableToUpdateUser = 'UnableToUpdateUser',
  CardIsLockedByBulkWithdraw = 'CardIsLockedByBulkWithdraw',

  AuthJwtHanderInitError = 'AuthJwtHanderInitError',
  AuthJwtHanderRefreshTokenCreationError = 'AuthJwtHanderRefreshTokenCreationError',
  AuthJwtHanderAccessTokenCreationError = 'AuthJwtHanderAccessTokenCreationError',
  AuthUserNotAuthenticated = 'AuthUserNotAuthenticated',
  AuthHostMissingInRequest = 'AuthHostMissingInRequest',
  LnurlAuthLoginHashInvalid = 'LnurlAuthLoginHashInvalid',

  AccessTokenMissing = 'AccessTokenMissing',
  AccessTokenInvalid = 'AccessTokenInvalid',
  AccessTokenExpired = 'AccessTokenExpired',

  ZodErrorParsingUserByKey = 'ZodErrorParsingUserByKey',
  ZodErrorParsingUserByLnurlAuthKey = 'ZodErrorParsingUserByLnurlAuthKey',
  ZodErrorParsingAccessTokenPayload = 'ZodErrorParsingAccessTokenPayload',
  ZodErrorParsingCardByKey = 'ZodErrorParsingCardByKey',
  ZodErrorParsingSetByKey = 'ZodErrorParsingSetByKey',
  ZodErrorParsingBulkWithdrawByKey = 'ZodErrorParsingBulkWithdrawByKey',
  UnableToLockCard = 'UnableToLockCard',
  CardHashRequired = 'CardHashRequired',
  WithdrawIsPending = 'WithdrawIsPending',

  LockManagerAquireTimeout = 'LockManagerAquireTimeout',
  LockManagerResourceNotLocked = 'LockManagerResourceNotLocked',
  LockManagerResourceLockedWithDifferentLock = 'LockManagerResourceLockedWithDifferentLock',

  // auth error codes
  RefreshTokenMissing = 'RefreshTokenMissing',
  RefreshTokenInvalid = 'RefreshTokenInvalid',
  RefreshTokenExpired = 'RefreshTokenExpired',
  RefreshTokenDenied = 'RefreshTokenDenied',
}

export const authErrorCodes = [
  ErrorCode.RefreshTokenMissing,
  ErrorCode.RefreshTokenInvalid,
  ErrorCode.RefreshTokenExpired,
  ErrorCode.RefreshTokenDenied,
]

export const ErrorCodeEnum = z.nativeEnum(ErrorCode)

export type ErrorCodeEnum = z.infer<typeof ErrorCodeEnum>

export const ErrorResponse = z.object({
  status: z.string(),
  reason: z.string().optional(),
  message: z.string().optional(),
  code: ErrorCodeEnum.optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponse>

export type ToErrorResponse = ({ message, code }: { message: string, code?: ErrorCode })
  => ErrorResponse

export class ErrorWithCode extends Error {
  static fromTrpcMessage(message: string): ErrorWithCode {
    const [, code, error] = message.split('|')
    return new ErrorWithCode(
      error,
      ErrorCodeEnum.parse(code),
    )
  }

  readonly error: unknown
  readonly code: ErrorCode

  constructor(error: unknown, code: ErrorCode) {
    super(code)
    this.error = error
    this.code = code
    Object.setPrototypeOf(this, ErrorWithCode.prototype)
  }

  toTrpcMessage() {
    return `ErrorWithCode|${this.code}|${this.error}`
  }
}
