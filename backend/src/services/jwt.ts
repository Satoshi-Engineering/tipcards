import assert from 'assert'
import axios from 'axios'
import crypto from 'crypto'

import { AccessTokenPayload } from '@shared/data/auth/index.js'
import JwtValidator from '@shared/modules/Jwt/JwtValidator.js'
import JwtKeyPairHandler from '@shared/modules/Jwt/JwtKeyPairHandler.js'

import { EXPRESS_PORT, JWT_AUTH_ISSUER } from '@backend/constants.js'

const PUBLIC_KEY_API = `http://localhost:${EXPRESS_PORT}/auth/api/publicKey`

let jwtValidator: JwtValidator | null = null

export const getJwtValidator = () => {
  if (jwtValidator == null) {
    throw new Error('JwtValidator not initialized. Call initJwtValidator() first')
  }
  return jwtValidator
}

export const initJwtValidator = async () => {
  if (jwtValidator != null) {
    throw new Error('JwtValidator already initialized')
  }

  const response = await axios(PUBLIC_KEY_API)
  const publicKey = await JwtKeyPairHandler.convertPublicKeyToKeyLike({
    publicKeyAsString: response.data.data,
  })
  assert(publicKey instanceof crypto.KeyObject, `Could not load publicKey from ${PUBLIC_KEY_API}`)
  jwtValidator = new JwtValidator(publicKey, JWT_AUTH_ISSUER)
}

/**
 * @throws jose errors
 * @throws ZodError
 * @deprecated use await getJwtValidator() & jwtValidator.validate(jwt, audience)
 */
export const validateJwt = async (jwt: string, audience: string): Promise<AccessTokenPayload> => {
  const jwtValidator = await getJwtValidator()
  const payload = await jwtValidator.validate(jwt, audience)
  return AccessTokenPayload.parse(payload)
}
