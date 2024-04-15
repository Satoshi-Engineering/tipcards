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
  AccessTokenMissing = 'AccessTokenMissing',
  AccessTokenInvalid = 'AccessTokenInvalid',
  AccessTokenExpired = 'AccessTokenExpired',
  InvalidInput = 'InvalidInput',
  SetBelongsToAnotherUser = 'SetBelongsToAnotherUser',
  SetAlreadyFunded = 'SetAlreadyFunded',
  SetInvoiceAlreadyExists = 'SetInvoiceAlreadyExists',
  CardLogoNotFound = 'CardLogoNotFound',
  LnurlpTooManyPaymentRequests = 'LnurlpTooManyPaymentRequests',
  LnbitsPaymentRequestsMalformedResponse = 'LnbitsPaymentRequestsMalformedResponse',
  RefreshTokenMissing = 'RefreshTokenMissing',
  RefreshTokenInvalid = 'RefreshTokenInvalid',
  RefreshTokenExpired = 'RefreshTokenExpired',
  RefreshTokenDenied = 'RefreshTokenDenied',
  LnbitsLnurlpPaymentsNotFound = 'LnbitsLnurlpPaymentsNotFound',
  TooManySetsForUser = 'TooManySetsForUser',
  FoundMultipleUsersForLnurlAuthKey = 'FoundMultipleUsersForLnurlAuthKey',
  UnableToGetAllUsers = 'UnableToGetAllUsers',
  PermissionsMissing = 'PermissionsMissing',
  UnableToParseEnvVar = 'UnableToParseEnvVar',
  UnableToGetLnbitsBulkWithdrawStatus = 'UnableToGetLnbitsBulkWithdrawStatus',
  UnableToParseLnbitsPaymentsForCardPaymentInfo = 'UnableToParseLnbitsPaymentsForCardPaymentInfo',

  ZodErrorParsingUserByKey = 'ZodErrorParsingUserByKey',
  ZodErrorParsingUserByLnurlAuthKey = 'ZodErrorParsingUserByLnurlAuthKey',
  ZodErrorParsingAccessTokenPayload = 'ZodErrorParsingAccessTokenPayload',
  ZodErrorParsingCardByKey = 'ZodErrorParsingCardByKey',
  ZodErrorParsingSetByKey = 'ZodErrorParsingSetByKey',
  ZodErrorParsingBulkWithdrawByKey = 'ZodErrorParsingBulkWithdrawByKey',
  UnableToLockCard = 'UnableToLockCard',
  CardHashRequired = 'CardHashRequired',
  WithdrawIsPending = 'WithdrawIsPending',
}

export const ErrorCodeEnum = z.nativeEnum(ErrorCode)

export type ErrorCodeEnum = z.infer<typeof ErrorCodeEnum>

export type ToErrorResponse = ({ message, code }: { message: string, code?: ErrorCode }) => {
  status: string
  reason?: string
  message?: string
  code?: ErrorCode
}

export class ErrorWithCode {
  error: unknown
  code: ErrorCode

  constructor(error: unknown, code: ErrorCode) {
    this.error = error
    this.code = code
    Object.setPrototypeOf(this, ErrorWithCode.prototype)
  }
}
