import assert from 'assert'
import axios from 'axios'
import crypto from 'crypto'

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
