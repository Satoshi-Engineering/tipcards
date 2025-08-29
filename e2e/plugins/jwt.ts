/// <reference types="cypress" />

import { randomUUID } from 'crypto'

import { AccessTokenPayload } from '../../shared/src/data/auth/index'

import { getJwtIssuer, getRefreshTokenPayload, getAccessTokenPayload } from '../lib/jwtHelpers'

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
      const payload = await getRefreshTokenPayload({ jwt: refreshToken })
      const expiredRefreshToken = jwtIssuer.createJwt(
        process.env.JWT_AUTH_ISSUER,
        '0 seconds',
        payload,
      )

      return expiredRefreshToken
    },

    'jwt:generateInvalidRefreshToken': async ({ refreshToken }: { refreshToken: string }) => {
      const jwtIssuer = await getJwtIssuer()
      const payload = await getRefreshTokenPayload({ jwt: refreshToken })
      const expiredRefreshToken = jwtIssuer.createJwt(
        'invalid-audience',
        '28 days',
        payload,
      )

      return expiredRefreshToken
    },

    'jwt:generateExpiredAccessToken': async ({ refreshToken }: { refreshToken: string }) => {
      const jwtIssuer = await getJwtIssuer()
      const { userId, nonce } = await getRefreshTokenPayload({ jwt: refreshToken })

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
        process.env.JWT_TIPCARDS_API,
        '70 seconds',
        payload,
      )

      return expiredAccessToken
    },

    'jwt:validateRefreshToken': async ({
      refreshToken,
    }: {
      refreshToken: string,
    } ) => {
      const { userId, sessionId, nonce } = await getRefreshTokenPayload({ jwt: refreshToken })

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

    'jwt:validateAccessToken': async ({
      accessToken,
    }: {
      accessToken: string,
    } ) => {
      try {
        const payload = await getAccessTokenPayload({ jwt: accessToken })
        AccessTokenPayload.parse(payload)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
  })

  return config
}
