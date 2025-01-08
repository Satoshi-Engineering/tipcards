import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import { ErrorCode, ErrorWithCode, authErrorCodes } from '@shared/data/Errors.js'

import NotFoundError from '@backend/errors/NotFoundError.js'
import UserError from '@backend/errors/UserError.js'

type Mutable = {
  -readonly [key in keyof TRPCError]: TRPCError[key];
}

export const mapApplicationErrorToTrpcError = (trpcError: TRPCError) => {
  const mutableError = trpcError as Mutable
  if (trpcError.cause instanceof UserError) {
    mutableError.code = 'BAD_REQUEST'
    mutableError.message = trpcError.cause.message
  } else if (trpcError.cause instanceof NotFoundError) {
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

export const isUnauthorizedError = (errorWithCode: ErrorWithCode) => authErrorCodes.includes(errorWithCode.code)

const transformTRPCErrorAccordingToErrorWithCodeErrorCode = (errorWithCoderError: ErrorWithCode, trpcError: Mutable) => {
  trpcError.message = errorWithCoderError.toTrpcMessage()

  if (isUnauthorizedError(errorWithCoderError)) {
    trpcError.code = 'UNAUTHORIZED'
  }

  if (errorWithCoderError.code === ErrorCode.PermissionDenied) {
    trpcError.code = 'FORBIDDEN'
  }
}
