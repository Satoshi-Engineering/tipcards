import JwtIssuer from '../../shared/src/modules/Jwt/JwtIssuer'
import JwtKeyPairHandler from '../../shared/src/modules/Jwt/JwtKeyPairHandler'
import type { KeyPair } from '../../shared/src/modules/Jwt/types/KeyPair'

import { getRequiredEnvironmentVariable } from './environment'

let jwtIssuer: JwtIssuer

export const getJwtIssuer = async () => {
  if (jwtIssuer) {
    return jwtIssuer
  }
  const keyPairHandler = new JwtKeyPairHandler(getRequiredEnvironmentVariable('JWT_AUTH_KEY_DIRECTORY'))
  // Node and DOM declare slightly different Web Crypto key usages, but JOSE accepts both at runtime.
  const keyPair = await keyPairHandler.loadKeyPairFromDirectory() as KeyPair | null
  if (!keyPair) {
    throw new Error('Could not load the JWT key pair.')
  }

  return jwtIssuer = new JwtIssuer(keyPair, getRequiredEnvironmentVariable('JWT_AUTH_ISSUER'))
}

export const getRefreshTokenPayload = async ({ jwt }: { jwt: string }) => {
  const jwtIssuer = await getJwtIssuer()
  return await jwtIssuer.validate(jwt, getRequiredEnvironmentVariable('JWT_AUTH_ISSUER'))
}

export const getAccessTokenPayload = async ({ jwt }: { jwt: string }) => {
  const jwtIssuer = await getJwtIssuer()
  return await jwtIssuer.validate(jwt, getRequiredEnvironmentVariable('JWT_TIPCARDS_API'))
}
