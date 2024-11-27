import type { Request, Response, NextFunction } from 'express'
import { errors } from 'jose'
import { ZodError } from 'zod'

import { AccessTokenPayload } from '@shared/data/auth/index.js'
import { ErrorCode } from '@shared/data/Errors.js'

import { getJwtValidator } from '@backend/services/jwt.js'

/**
 * validate access token.
 * if the token is valid, we make sure a user with the given foreign key exists in the application database.
 * if needed, a new user is created.
 */
export const authGuardAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host')
  if (typeof host !== 'string') {
    console.error('Invalid host while checking access token', { host })
    res.status(400).json({
      status: 'error',
      data: 'Invalid auth service host.',
    })
    return
  }

  if (req.headers.authorization == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization header missing.',
      code: ErrorCode.AccessTokenMissing,
    })
    return
  }

  try {
    const jwtValidator = getJwtValidator()
    const payload = await jwtValidator.validate(req.headers.authorization, host)
    const accessToken = AccessTokenPayload.parse(payload)
    res.locals.accessTokenPayload = accessToken
    next()
  } catch (error) {
    let message = 'Invalid authorization token.'
    let code = ErrorCode.AccessTokenInvalid
    if (error instanceof errors.JWTExpired) {
      message = 'Authorization expired.'
      code = ErrorCode.AccessTokenExpired
    } else if (error instanceof ZodError) {
      message = 'JWT payload parsing failed.'
      code = ErrorCode.ZodErrorParsingAccessTokenPayload
      console.error(code, error)
    }
    res.status(401).json({
      status: 'error',
      message,
      code,
    })
  }
}
