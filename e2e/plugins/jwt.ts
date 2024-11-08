/// <reference types="cypress" />

import { randomUUID } from 'crypto'

import JwtIssuer from '../../shared/src/modules/Jwt/JwtIssuer'
import JwtKeyPairHandler from '../../shared/src/modules/Jwt/JwtKeyPairHandler'

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('task', {
    'jwt:createRefreshTokenFormatAllowedRefreshTokens': async ({
      expirationTime,
      userId,
      lnurlAuthKey,
    }: {
      expirationTime: string,
      userId: string,
      lnurlAuthKey: string,
    } ) => {
      const nonce = randomUUID()
      const payload = {
        id: userId,
        lnurlAuthKey,
        nonce,
      }
      const jwtIssuer = await getJwtIssuer()
      return await jwtIssuer.createJwt(process.env.JWT_AUTH_ISSUER, expirationTime, payload)
    },
  })

  on('task', {
    'jwt:validateRefreshTokenFormatAllowedSessions': async ({
      refreshToken,
    }: {
      refreshToken: string,
    } ) => {
      const jwtIssuer = await getJwtIssuer()
      const { userId, sessionId, nonce } = await jwtIssuer.validate(refreshToken, process.env.JWT_AUTH_ISSUER)

      if (typeof userId != 'string' && (userId as string).length <= 10) {
        return false
      }
      if (typeof sessionId != 'string' && (sessionId as string).length <= 10) {
        return false
      }
      if (typeof nonce != 'string' && (nonce as string).length <= 10) {
        return false
      }

      return true
    },
  })

  let jwtIssuer: JwtIssuer

  const getJwtIssuer = async () => {
    if (jwtIssuer) {
      return jwtIssuer
    }
    const keyPairHandler = new JwtKeyPairHandler(process.env.JWT_AUTH_KEY_DIRECTORY)
    const keyPair = await keyPairHandler.loadKeyPairFromDirectory()
    return jwtIssuer = new JwtIssuer(keyPair, process.env.JWT_AUTH_ISSUER)
  }

  return config
}
