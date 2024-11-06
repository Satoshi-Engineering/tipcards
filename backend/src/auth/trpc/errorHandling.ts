import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import NotFoundError from '@backend/errors/NotFoundError.js'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

type Mutable = {
  -readonly [key in keyof TRPCError]: TRPCError[key];
}

export const mapApplicationErrorToTrpcError = (trpcError: TRPCError) => {
  const mutableError = trpcError as Mutable
  if (trpcError.cause instanceof NotFoundError) {
    mutableError.code = 'NOT_FOUND'
    mutableError.message = trpcError.cause.message
  } else if (trpcError.cause instanceof ZodError) {
    mutableError.message = 'Unexpected zod parsing error.'
  }

  if (trpcError.cause instanceof ErrorWithCode) {
    transformTRPCErrorAccordingToErrorWithCodeErrorCode(trpcError.cause, mutableError)
  }

  if (trpcError.code === 'INTERNAL_SERVER_ERROR') {
    console.error(trpcError)
  }
}

export const isUnauthorizedError = (errorWithCoderError: ErrorWithCode) => {
  if (errorWithCoderError.code === ErrorCode.LnurlAuthLoginHashInvalid) {
    return true
  }
  if (errorWithCoderError.code === ErrorCode.RefreshTokenMissing) {
    return true
  }
  if (errorWithCoderError.code === ErrorCode.RefreshTokenExpired) {
    return true
  }
  if (errorWithCoderError.code === ErrorCode.RefreshTokenDenied) {
    return true
  }
}

const transformTRPCErrorAccordingToErrorWithCodeErrorCode = (errorWithCoderError: ErrorWithCode, trpcError: Mutable) => {
  trpcError.message = errorWithCoderError.toTrpcMessage()

  if (isUnauthorizedError(errorWithCoderError)) {
    trpcError.code = 'UNAUTHORIZED'
  }
}
