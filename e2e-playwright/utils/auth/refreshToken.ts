import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'

import { z } from 'zod'

import JwtIssuer from '@shared/modules/Jwt/JwtIssuer'
import JwtKeyPairHandler from '@shared/modules/Jwt/JwtKeyPairHandler'
import type { KeyPair } from '@shared/modules/Jwt/types/KeyPair'

import getSqlClient from '../database/sqlClient'

type UserOptions = {
  profileEmail?: string
  lnurlAuthKey?: string
}

type RefreshTokenOptions = {
  expirationTime?: string
  sessionId?: string
  userId?: string
}

export const createUser = async ({
  profileEmail = '',
  lnurlAuthKey = randomUUID(),
}: UserOptions = {}) => {
  const sql = getSqlClient()
  const userId = createHash('sha256').update(lnurlAuthKey).digest('hex')

  await sql`
    INSERT INTO public."User"(
      id, "lnurlAuthKey", created, permissions)
    VALUES (${userId}, ${lnurlAuthKey}, NOW(), '[]');
  `
  await sql`
    INSERT INTO public."Profile"(
      "user", "accountName", "displayName", email)
    VALUES (${userId}, '', '', ${profileEmail});
  `

  return { lnurlAuthKey, userId }
}

export const createAllowedSession = async (userId: string) => {
  const sql = getSqlClient()
  const sessionId = randomUUID()

  await sql`
    INSERT INTO public."AllowedSession"(
      "user", "sessionId")
    VALUES (${userId}, ${sessionId});
  `

  return sessionId
}

export const createRefreshToken = async ({
  expirationTime = '28d',
  sessionId,
  userId,
}: RefreshTokenOptions = {}) => {
  if (!userId) {
    userId = (await createUser()).userId
  }
  if (!sessionId) {
    sessionId = await createAllowedSession(userId)
  }

  const jwtIssuer = await getJwtIssuer()

  return await jwtIssuer.createJwt(getRequiredEnvironmentVariable('JWT_AUTH_ISSUER'), expirationTime, {
    userId,
    sessionId,
    nonce: randomUUID(),
  })
}

export const generateExpiredRefreshToken = async (refreshToken: string) => {
  const jwtIssuer = await getJwtIssuer()
  const payload = await getRefreshTokenPayload(refreshToken)
  return await jwtIssuer.createJwt(getRequiredEnvironmentVariable('JWT_AUTH_ISSUER'), '0 seconds', payload)
}

export const generateInvalidRefreshToken = async (refreshToken: string) => {
  const jwtIssuer = await getJwtIssuer()
  const payload = await getRefreshTokenPayload(refreshToken)
  return await jwtIssuer.createJwt('invalid-audience', '28 days', payload)
}

export const generateExpiringAccessToken = async (refreshToken: string) => {
  const jwtIssuer = await getJwtIssuer()
  const { nonce, userId } = await getRefreshTokenPayload(refreshToken)
  const payload = {
    userId: userId as string,
    permissions: [],
    nonce: nonce as string,
  }
  return await jwtIssuer.createJwt(getRequiredEnvironmentVariable('JWT_TIPCARDS_API'), '70 seconds', payload)
}

export const validateAccessToken = async (accessToken: string) => {
  try {
    const jwtIssuer = await getJwtIssuer()
    const payload = await jwtIssuer.validate(accessToken, getRequiredEnvironmentVariable('JWT_TIPCARDS_API'))
    AccessTokenPayload.parse(payload)
    return true
  } catch {
    return false
  }
}

const AccessTokenPayload = z.object({
  userId: z.string(),
  permissions: z.enum(['statistics', 'support']).array().default(() => []),
  nonce: z.string().uuid(),
})

export const logoutAllDevices = async (refreshToken: string) => {
  const sql = getSqlClient()
  const { userId } = await getRefreshTokenPayload(refreshToken)
  await sql`DELETE FROM public."AllowedSession" WHERE "user"=${userId as string};`
}

let jwtIssuer: JwtIssuer

const getJwtIssuer = async () => {
  if (jwtIssuer) {
    return jwtIssuer
  }

  const keyDirectory = getRequiredEnvironmentVariable('JWT_AUTH_KEY_DIRECTORY')
  const keyPairHandler = new JwtKeyPairHandler(path.resolve('e2e-playwright', keyDirectory))
  const keyPair = await keyPairHandler.loadKeyPairFromDirectory() as KeyPair | null
  if (!keyPair) {
    throw new Error('Could not load the JWT key pair.')
  }

  return jwtIssuer = new JwtIssuer(keyPair, getRequiredEnvironmentVariable('JWT_AUTH_ISSUER'))
}

const getRefreshTokenPayload = async (refreshToken: string) => {
  const jwtIssuer = await getJwtIssuer()
  return await jwtIssuer.validate(refreshToken, getRequiredEnvironmentVariable('JWT_AUTH_ISSUER'))
}

const getRequiredEnvironmentVariable = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}
