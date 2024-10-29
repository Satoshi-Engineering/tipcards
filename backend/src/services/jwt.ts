import assert from 'assert'

import { AccessTokenPayload } from '@shared/data/auth/index.js'
import JwtValidator from '@backend/services/Jwt/JwtValidator.js'
import JwtKeyPairHandler from '@backend/services/Jwt/JwtKeyPairHandler.js'

import { JWT_AUTH_ISSUER } from '@backend/constants.js'
import { JWT_AUTH_KEY_DIRECTORY } from '@auth/constants.js'

let jwtValidator: JwtValidator | null = null

const getJwtValidator = async (): Promise<JwtValidator> => {
  if (jwtValidator == null) {
    const jwtKeyPairHandler = new JwtKeyPairHandler(JWT_AUTH_KEY_DIRECTORY)
    const keyPair = await jwtKeyPairHandler.loadKeyPairFromDirectory()
    assert(keyPair != null, 'Could not load Key Pair from disk')
    jwtValidator = new JwtValidator(keyPair.publicKey, JWT_AUTH_ISSUER)
  }
  return jwtValidator
}

/**
 * @throws jose errors
 * @throws ZodError
 */
export const validateJwt = async (jwt: string, audience: string): Promise<AccessTokenPayload> => {
  const jwtValidator = await getJwtValidator()
  const payload = await jwtValidator.validate(jwt, audience)
  return AccessTokenPayload.parse(payload)
}
