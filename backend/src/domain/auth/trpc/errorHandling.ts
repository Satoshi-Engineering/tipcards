import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import NotFoundError from '../../../errors/NotFoundError.js'

type Mutable = {
  -readonly [key in keyof TRPCError]: TRPCError[key];
}

const transformErrorWithCodeErrors = (errorWithCoderError: ErrorWithCode, trpcError: Mutable) => {
  trpcError.message = errorWithCoderError.toTrpcMessage()

  if (errorWithCoderError.code === ErrorCode.LnurlAuthLoginHashInvaid) {
    trpcError.code = 'UNAUTHORIZED'
  }
}

export const mapApplicationErrorToTrpcError = (trpcError: TRPCError) => {
  const mutableError = trpcError as Mutable
  if (trpcError.cause instanceof NotFoundError) {
    mutableError.code = 'NOT_FOUND'
    mutableError.message = trpcError.cause.message
  } else if (trpcError.cause instanceof ErrorWithCode) {
    transformErrorWithCodeErrors(trpcError.cause, mutableError)
  } else if (trpcError.cause instanceof ZodError) {
    mutableError.message = 'Unexpected zod parsing error.'
  }

  if (trpcError.code === 'INTERNAL_SERVER_ERROR') {
    console.error(trpcError)
  }
}
