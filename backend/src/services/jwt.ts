import type { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import {
  generateKeyPair, type KeyLike, SignJWT, jwtVerify,
  importSPKI, importPKCS8, exportSPKI, exportPKCS8,
} from 'jose'

import { ErrorCode } from '../../../src/data/Errors'
import type { User } from '../../../src/data/User'

const FILENAME_PUBLIC = 'lnurl.auth.pem.pub'
const FILENAME = 'lnurl.auth.pem'
const alg = 'RS256'

const ISSUER = 'tipcards:auth'
const AUDIENCE_REFRESH_TOKEN = 'tipcards:auth'
const AUDIENCE_ACCESS_TOKEN = 'tipcards'

let publicKey: KeyLike
let privateKey: KeyLike
const loadKeys = async () => {
  if (publicKey != null && privateKey != null) {
    return { publicKey, privateKey }
  }
  try {
    if (fs.existsSync(FILENAME_PUBLIC) && fs.existsSync(FILENAME)) {
      let data = fs.readFileSync(FILENAME_PUBLIC, 'utf8')
      publicKey = await importSPKI(data, alg)
      data = fs.readFileSync(FILENAME, 'utf8')
      privateKey = await importPKCS8(data, alg)
    } else {
      ({ publicKey, privateKey } = await generateKeyPair(alg))
      const spkiPem = await exportSPKI(publicKey)
      fs.writeFileSync(FILENAME_PUBLIC, spkiPem)
      const pkcs8Pem = await exportPKCS8(privateKey)
      fs.writeFileSync(FILENAME, pkcs8Pem)
    }
  } catch (error) {
    console.error(error)
  }
  return { publicKey, privateKey }
}

export const createRefreshToken = async ({ id, lnurlAuthKey }: User, expires: Date) => {
  const { privateKey } = await loadKeys()
  return new SignJWT({ id, lnurlAuthKey })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE_REFRESH_TOKEN)
    .setExpirationTime(Math.floor(expires.getTime() / 1000))
    .sign(privateKey)
}

export const createAccessToken = async ({ id, lnurlAuthKey }: User) => {
  const { privateKey } = await loadKeys()
  return new SignJWT({ id, lnurlAuthKey })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE_ACCESS_TOKEN)
    .setExpirationTime('5 minutes')
    .sign(privateKey)
}

export const authGuardRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
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
      issuer: ISSUER,
      audience: AUDIENCE_REFRESH_TOKEN,
    })
    if (payload.exp == null || payload.exp * 1000 < + new Date()) {
      res.status(401).json({
        status: 'error',
        message: 'Refresh token expired.',
        code: ErrorCode.RefreshTokenExpired,
      })
      return
    }
    res.locals.refreshTokenPayload = payload
    next()
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token.',
      code: ErrorCode.RefreshTokenInvalid,
    })
  }
}

export const authGuardAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { publicKey } = await loadKeys()

  if (req.headers.authorization == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization header missing.',
      code: ErrorCode.AccessTokenMissing,
    })
    return
  }

  try {
    const { payload } = await jwtVerify(req.headers.authorization, publicKey, {
      issuer: ISSUER,
      audience: AUDIENCE_ACCESS_TOKEN,
    })
    if (payload.exp == null || payload.exp * 1000 < + new Date()) {
      res.status(401).json({
        status: 'error',
        message: 'Authorization expired.',
        code: ErrorCode.AccessTokenExpired,
      })
      return
    }
    res.locals.jwtPayload = payload
    next()
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid authorization token.',
      code: ErrorCode.AccessTokenInvalid,
    })
  }
}
