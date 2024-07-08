import { randomUUID } from 'crypto'
import fs from 'fs'
import {
  generateKeyPair, type KeyLike, SignJWT, jwtVerify,
  importSPKI, importPKCS8, exportSPKI, exportPKCS8,
  errors,
} from 'jose'
import path from 'path'

import { AccessTokenPayload as ZodAccessTokenPayload, type AccessTokenPayload } from '@shared/data/auth'

import type { User } from '@backend/database/redis/data/User'
import { JWT_AUTH_KEY_DIRECTORY, JWT_AUTH_ISSUER, JWT_AUTH_AUDIENCE } from '@backend/constants'

const FILENAME_PUBLIC = 'lnurl.auth.pem.pub'
const filenamePublicResolved = path.resolve(JWT_AUTH_KEY_DIRECTORY, FILENAME_PUBLIC)
const FILENAME = 'lnurl.auth.pem'
const filenameResolved = path.resolve(JWT_AUTH_KEY_DIRECTORY, FILENAME)
const alg = 'RS256'

let publicKey: KeyLike
let privateKey: KeyLike
export const loadKeys = async () => {
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
  const nonce = randomUUID()
  return new SignJWT({ id, lnurlAuthKey, nonce })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(JWT_AUTH_ISSUER)
    .setAudience(JWT_AUTH_ISSUER)
    .setExpirationTime('28 days')
    .sign(privateKey)
}

export const createAccessToken = async ({ id, lnurlAuthKey, permissions }: User) => {
  const { privateKey } = await loadKeys()
  const nonce = randomUUID()
  const payload: AccessTokenPayload = { id, lnurlAuthKey, permissions, nonce }
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(JWT_AUTH_ISSUER)
    .setAudience(JWT_AUTH_AUDIENCE)
    .setExpirationTime('5 minutes')
    .sign(privateKey)
}

/**
 * @throws jose errors
 * @throws ZodError
 */
export const validateJwt = async (jwt: string, audience: string): Promise<AccessTokenPayload> => {
  const { publicKey } = await loadKeys()
  const { payload } = await jwtVerify(jwt, publicKey, {
    issuer: JWT_AUTH_ISSUER,
    audience,
  })
  if (payload.exp == null || payload.exp * 1000 < + new Date()) {
    throw new errors.JWTExpired('Authorization expired.', payload)
  }
  return ZodAccessTokenPayload.parse(payload)
}
