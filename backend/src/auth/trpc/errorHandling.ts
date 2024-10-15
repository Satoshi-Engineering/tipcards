import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import NotFoundError from '@backend/errors/NotFoundError.js'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

type Mutable = {
  -readonly [key in keyof TRPCError]: TRPCError[key];
}

const transformTRPCErrorAccordingToErrorWithCodeErrorCode = (errorWithCoderError: ErrorWithCode, trpcError: Mutable) => {
  trpcError.message = errorWithCoderError.toTrpcMessage()

  if (errorWithCoderError.code === ErrorCode.LnurlAuthLoginHashInvaid) {
    trpcError.code = 'UNAUTHORIZED'
  }
}

export const mapApplicationErrorToTrpcError = (error: Error) => {
  let trpcError: TRPCError

  if (error instanceof TRPCError) {
    trpcError = error
  } else {
    trpcError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error })
  }

  const mutableError = trpcError as Mutable
  if (trpcError.cause instanceof NotFoundError) {
    mutableError.code = 'NOT_FOUND'
    mutableError.message = trpcError.cause.message
  } else if (trpcError.cause instanceof ErrorWithCode) {
    transformTRPCErrorAccordingToErrorWithCodeErrorCode(trpcError.cause, mutableError)
  } else if (trpcError.cause instanceof ZodError) {
    mutableError.message = 'Unexpected zod parsing error.'
  }

  if (trpcError.code === 'INTERNAL_SERVER_ERROR') {
    console.error(trpcError)
  }
}
