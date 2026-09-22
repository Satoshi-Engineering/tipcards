import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'

import JwtIssuer from '@shared/modules/Jwt/JwtIssuer'
import JwtKeyPairHandler from '@shared/modules/Jwt/JwtKeyPairHandler'
import type { KeyPair } from '@shared/modules/Jwt/types/KeyPair'

import getSqlClient from '../database/sqlClient'

export const createRefreshToken = async () => {
  const sql = getSqlClient()
  const lnurlAuthKey = randomUUID()
  const userId = createHash('sha256').update(lnurlAuthKey).digest('hex')
  const sessionId = randomUUID()

  await sql`
    INSERT INTO public."User"(
      id, "lnurlAuthKey", created, permissions)
    VALUES (${userId}, ${lnurlAuthKey}, NOW(), '[]');
  `
  await sql`
    INSERT INTO public."Profile"(
      "user", "accountName", "displayName", email)
    VALUES (${userId}, '', '', '');
  `
  await sql`
    INSERT INTO public."AllowedSession"(
      "user", "sessionId")
    VALUES (${userId}, ${sessionId});
  `

  const keyDirectory = getRequiredEnvironmentVariable('JWT_AUTH_KEY_DIRECTORY')
  const keyPairHandler = new JwtKeyPairHandler(path.resolve('e2e-playwright', keyDirectory))
  const keyPair = await keyPairHandler.loadKeyPairFromDirectory() as KeyPair | null
  if (!keyPair) {
    throw new Error('Could not load the JWT key pair.')
  }

  const issuer = getRequiredEnvironmentVariable('JWT_AUTH_ISSUER')
  const jwtIssuer = new JwtIssuer(keyPair, issuer)

  return await jwtIssuer.createJwt(issuer, '28d', {
    userId,
    sessionId,
    nonce: randomUUID(),
  })
}

const getRequiredEnvironmentVariable = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}
