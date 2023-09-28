import type { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import {
  generateKeyPair, type KeyLike, SignJWT, jwtVerify,
  importSPKI, importPKCS8, exportSPKI, exportPKCS8,
  errors,
} from 'jose'
import path from 'path'
import { ZodError } from 'zod'

import { ErrorCode } from '../../../src/data/Errors'
import {
  type User,
  AccessTokenPayload as ZodAccessTokenPayload, AccessTokenPayload,
} from '../../../src/data/User'

import { getUserById, updateUser } from './database'
import { JWT_AUTH_KEY_DIRECTORY, JWT_AUTH_ISSUER, JWT_AUTH_AUDIENCE } from '../constants'

const FILENAME_PUBLIC = 'lnurl.auth.pem.pub'
const filenamePublicResolved = path.resolve(JWT_AUTH_KEY_DIRECTORY, FILENAME_PUBLIC)
const FILENAME = 'lnurl.auth.pem'
const filenameResolved = path.resolve(JWT_AUTH_KEY_DIRECTORY, FILENAME)
const alg = 'RS256'

let publicKey: KeyLike
let privateKey: KeyLike
const loadKeys = async () => {
  if (publicKey != null && privateKey != null) {
    return { publicKey, privateKey }
  }
  try {
    if (fs.existsSync(filenamePublicResolved) && fs.existsSync(filenameResolved)) {
      let data = fs.readFileSync(filenamePublicResolved, 'utf8')
      publicKey = await importSPKI(data, alg)
      data = fs.readFileSync(filenameResolved, 'utf8')
      privateKey = await importPKCS8(data, alg)
    } else {
      ({ publicKey, privateKey } = await generateKeyPair(alg))
      const spkiPem = await exportSPKI(publicKey)
      fs.writeFileSync(filenamePublicResolved, spkiPem)
      const pkcs8Pem = await exportPKCS8(privateKey)
      fs.writeFileSync(filenameResolved, pkcs8Pem)
    }
  } catch (error) {
    console.error(error)
  }
  return { publicKey, privateKey }
}

export const getPublicKey = async () => {
  const { publicKey } = await loadKeys()
  return publicKey
}

export const createRefreshToken = async ({ id, lnurlAuthKey }: User) => {
  const { privateKey } = await loadKeys()
  return new SignJWT({ id, lnurlAuthKey })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(JWT_AUTH_ISSUER)
    .setAudience(JWT_AUTH_ISSUER)
    .setExpirationTime('28 days')
    .sign(privateKey)
}

export const createAccessToken = async ({ id, lnurlAuthKey, permissions }: User) => {
  const { privateKey } = await loadKeys()
  const payload: AccessTokenPayload = { id, lnurlAuthKey, permissions }
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(JWT_AUTH_ISSUER)
    .setAudience(JWT_AUTH_AUDIENCE)
    .setExpirationTime('5 minutes')
    .sign(privateKey)
}

export const authGuardRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host')
  if (typeof host !== 'string') {
    console.warn('Invalid host while checking refresh token', {
      host,
    })
    res.status(400).json({
      status: 'error',
      data: 'Invalid auth service host.',
    })
    return
  }

  const { publicKey } = await loadKeys()

  if (req.cookies?.refresh_token == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization cookie missing.',
      code: ErrorCode.RefreshTokenMissing,
    })
    return
  }

  try {
    const { payload } = await jwtVerify(req.cookies.refresh_token, publicKey, {
      issuer: JWT_AUTH_ISSUER,
      audience: host,
    })
    if (payload.exp == null || payload.exp * 1000 < + new Date()) {
      res
        .clearCookie('refresh_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        })
        .status(401)
        .json({
          status: 'error',
          message: 'Refresh token expired.',
          code: ErrorCode.RefreshTokenExpired,
        })
      return
    }

    const user = await getUserById(String(payload.id))
    if (
      user?.allowedRefreshTokens == null
      || !user.allowedRefreshTokens.find((currentRefreshTokens) => currentRefreshTokens.includes(req.cookies.refresh_token))
    ) {
      res
        .clearCookie('refresh_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        })
        .status(401)
        .json({
          status: 'error',
          message: 'Refresh token denied.',
          code: ErrorCode.RefreshTokenDenied,
        })
      return
    }

    res.locals.userId = payload.id
    next()
  } catch (error) {
    let message = 'Invalid refresh token.'
    let code = ErrorCode.RefreshTokenInvalid
    if (error instanceof errors.JWTExpired) {
      message = 'Refresh token expired.'
      code = ErrorCode.RefreshTokenExpired
    }
    res
      .clearCookie('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .status(401)
      .json({
        status: 'error',
        message,
        code,
      })
  }
}

export const cycleRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(res.locals.userId)
    if (user == null) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      })
      return
    }
    const refreshToken = await createRefreshToken(user)
    if (user.allowedRefreshTokens == null) {
      user.allowedRefreshTokens = []
    }
    const oldRefreshToken = req.cookies?.refresh_token
    user.allowedRefreshTokens = user.allowedRefreshTokens.map((currentRefreshTokens) => {
      if (!currentRefreshTokens.includes(oldRefreshToken)) {
        return currentRefreshTokens
      }
      if (currentRefreshTokens.length === 1) {
        return [...currentRefreshTokens, refreshToken]
      }
      return [currentRefreshTokens[currentRefreshTokens.length - 1], refreshToken]
    })
    await updateUser(user)
    res.cookie('refresh_token', refreshToken, {
      expires: new Date(+ new Date() + 1000 * 60 * 60 * 24 * 365),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    next()
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(403).json({
      status: 'error',
      data: 'unknown database error',
    })
  }
}

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

  const { publicKey } = await loadKeys()
  try {
    const { payload } = await jwtVerify(req.headers.authorization, publicKey, {
      issuer: JWT_AUTH_ISSUER,
      audience: host,
    })
    if (payload.exp == null || payload.exp * 1000 < + new Date()) {
      res.status(401).json({
        status: 'error',
        message: 'Authorization expired.',
        code: ErrorCode.AccessTokenExpired,
      })
      return
    }
    res.locals.accessTokenPayload = ZodAccessTokenPayload.parse(payload)
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
