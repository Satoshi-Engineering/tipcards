import { Request, Response, NextFunction } from 'express'
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

export const createJWT = async ({ id, lnurlAuthKey }: User) => {
  const { privateKey } = await loadKeys()
  return new SignJWT({ id, lnurlAuthKey })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('tipcards:auth')
    .setAudience('tipcards')
    .setExpirationTime('24h')
    .sign(privateKey)
}

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const { publicKey } = await loadKeys()

  if (req.headers.authorization == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization header missing.',
      code: ErrorCode.MissingAuthorizationHeader,
    })
    return
  }

  try {
    const { payload } = await jwtVerify(req.headers.authorization, publicKey)
    res.locals.jwtPayload = payload
    next()
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid authorization token.',
      code: ErrorCode.InvalidAuthorizationHeader,
    })
  }
}
