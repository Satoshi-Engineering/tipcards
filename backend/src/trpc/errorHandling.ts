import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import { ErrorWithCode } from '@shared/data/Errors.js'

import NotFoundError from '../errors/NotFoundError.js'
import UserError from '../errors/UserError.js'

type Mutable = {
  -readonly [key in keyof TRPCError]: TRPCError[key];
}

export const mapApplicationErrorToTrpcError = (error: TRPCError) => {
  const mutableError = error as Mutable
  if (error.cause instanceof UserError) {
    mutableError.code = 'BAD_REQUEST'
    mutableError.message = error.cause.message
  } else if (error.cause instanceof NotFoundError) {
    mutableError.code = 'NOT_FOUND'
    mutableError.message = error.cause.message
  } else if (error.cause instanceof ErrorWithCode) {
    mutableError.message = `Error with code: ${error.cause.code}`
    mutableError.cause = error.cause.error as Error
  } else if (error.cause instanceof ZodError) {
    mutableError.message = 'Unexpected zod parsing error.'
  }

  if (error.code === 'INTERNAL_SERVER_ERROR') {
    console.error(error)
  }
}
