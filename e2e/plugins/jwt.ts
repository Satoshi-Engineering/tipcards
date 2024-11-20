/// <reference types="cypress" />

import { randomUUID } from 'crypto'

import { AccessTokenPayload } from '../../shared/src/data/auth/index'

import { getJwtIssuer, getJwtPayload } from '../lib/jwtHelpers'

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('task', {
    'jwt:createRefreshToken': async ({
      expirationTime = '28d',
      userId,
      sessionId,
    }: {
      expirationTime? : string,
      userId: string,
      sessionId: string,
    } ) => {
      const nonce = randomUUID()
      const payload = {
        userId,
        sessionId,
        nonce,
      }
      const jwtIssuer = await getJwtIssuer()
      return await jwtIssuer.createJwt(process.env.JWT_AUTH_ISSUER, expirationTime, payload)
    },

    'jwt:generateExpiredRefreshToken': async ({ refreshToken }: { refreshToken: string }) => {
      const jwtIssuer = await getJwtIssuer()
      const payload = await getJwtPayload({ refreshToken })
      const expiredRefreshToken = jwtIssuer.createJwt(
        process.env.JWT_AUTH_ISSUER,
        '0 seconds',
        payload,
      )

      return expiredRefreshToken
    },

    'jwt:generateInvalidRefreshToken': async ({ refreshToken }: { refreshToken: string }) => {
      const jwtIssuer = await getJwtIssuer()
      const payload = await getJwtPayload({ refreshToken })
      const expiredRefreshToken = jwtIssuer.createJwt(
        'invalid-audience',
        '28 days',
        payload,
      )

      return expiredRefreshToken
    },

    'jwt:generateExpiredAccessToken': async ({ refreshToken }: { refreshToken: string }) => {
      const jwtIssuer = await getJwtIssuer()
      const { userId, nonce } = await getJwtPayload({ refreshToken })

      // the frontend requests a new access token,
      // if the current one expires within the next 60 seconds.
      // add another 10 seconds on top, so the frontend can do
      // some requests, before it fetches a new one.
      const payload: AccessTokenPayload = {
        userId: userId as string,
        permissions: [],
        nonce: nonce as string,
      }
      const expiredAccessToken = jwtIssuer.createJwt(
        process.env.JWT_AUTH_ISSUER,
        '70 seconds',
        payload,
      )

      return expiredAccessToken
    },

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

    'jwt:validateRefreshTokenFormatAllowedSessions': async ({
      refreshToken,
    }: {
      refreshToken: string,
    } ) => {
      const { userId, sessionId, nonce } = await getJwtPayload({ refreshToken })

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

  return config
}
