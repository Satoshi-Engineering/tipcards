/// <reference types="cypress" />

import crypto, { randomUUID } from 'crypto'
import postgres from 'postgres'

import JwtIssuer from '../../shared/src/modules/Jwt/JwtIssuer'
import JwtKeyPairHandler from '../../shared/src/modules/Jwt/JwtKeyPairHandler'

// This function is the entry point for plugins
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('task', {
    async setCardWithdrawnDateIntoPast(cardHash: string) {
      const cardVersion = await sql`
        SELECT "lnurlW" FROM public."CardVersion" WHERE card=${cardHash};
      `
      const lnbitsId = cardVersion[0].lnurlW
      await sql`
        UPDATE public."LnurlW"
        SET withdrawn='2024-01-01 12:00:00+00'
        WHERE "lnbitsId"=${lnbitsId};
      `
      return null
    },

    async generateExpiredRefreshToken(refreshToken: string) {
      const jwtIssuer = await getJwtIssuer()
      const payload = await jwtIssuer.validate(refreshToken, process.env.JWT_AUTH_ISSUER)
      const expiredRefreshToken = jwtIssuer.createJwt(
        process.env.JWT_AUTH_ISSUER,
        '0 seconds',
        payload,
      )

      return expiredRefreshToken
    },

    async logoutAllDevices(refreshToken: string) {
      const jwtIssuer = await getJwtIssuer()
      const payload = await jwtIssuer.validate(refreshToken, process.env.JWT_AUTH_ISSUER)
      const userId = String(payload.userId)
      await sql`DELETE FROM public."AllowedRefreshTokens" WHERE "user"=${userId};`
      await sql`DELETE FROM public."AllowedSession" WHERE "user"=${userId};`

      return userId
    },

    async generateInvalidRefreshToken(refreshToken: string) {
      const jwtIssuer = await getJwtIssuer()
      const payload = await jwtIssuer.validate(refreshToken, process.env.JWT_AUTH_ISSUER)
      const expiredRefreshToken = jwtIssuer.createJwt(
        'invalid-audience',
        '28 days',
        payload,
      )

      return expiredRefreshToken
    },

    async generateExpiredAccessToken(refreshToken: string) {
      const jwtIssuer = await getJwtIssuer()
      const payload = await jwtIssuer.validate(refreshToken, process.env.JWT_AUTH_ISSUER)

      // the frontend requests a new access token,
      // if the current one expires within the next 60 seconds.
      // add another 10 seconds on top, so the frontend can do
      // some requests, before it fetches a new one.
      const expiredAccessToken = jwtIssuer.createJwt(
        process.env.JWT_AUTH_ISSUER,
        '70 seconds',
        {
          id: payload.userId,
          lnurlAuthKey: '',
          permissions: [],
          nonce: payload.nonce,
        },
      )

      return expiredAccessToken
    },

    'db:createUser': async ({
      profileEmail = '',
      lnurlAuthKey = randomUUID(),
    }: {
      profileEmail?: string,
      lnurlAuthKey?: string,
    } = {}) => {
      const userId = hashSha256(lnurlAuthKey)

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
      return {
        userId,
        lnurlAuthKey,
      }
    },

    'db:insertAllowedRefreshToken': async ({
      userId,
      refreshToken,
    }: {
      userId: string,
      refreshToken: string,
    }) => {
      const id = hashSha256(refreshToken)

      await sql`
        INSERT INTO public."AllowedRefreshTokens"(
          hash, "user", current, previous)
          VALUES (${id}, ${userId}, ${refreshToken}, NULL);
      `
      return null
    },


    'db:insertAllowedSession': async ({
      userId,
    }: {
      userId: string,
    }) => {
      const sessionId = randomUUID()

      await sql`
        INSERT INTO public."AllowedSession"(
	      "user", "sessionId")
        VALUES (${userId}, ${sessionId});
      `
      return sessionId
    },
  })

  let sql: postgres.Sql
  let jwtIssuer: JwtIssuer

  const getJwtIssuer = async () => {
    if (jwtIssuer) {
      return jwtIssuer
    }
    const keyPairHandler = new JwtKeyPairHandler(process.env.JWT_AUTH_KEY_DIRECTORY)
    const keyPair = await keyPairHandler.loadKeyPairFromDirectory()
    return jwtIssuer = new JwtIssuer(keyPair, process.env.JWT_AUTH_ISSUER)
  }

  on('before:run', () => {
    const host = String(process.env.POSTGRES_HOST)
    const user = String(process.env.POSTGRES_USER)
    const port = parseInt(process.env.POSTGRES_PORT || '5432')
    const password = String(process.env.POSTGRES_PASSWORD)
    const database = String(process.env.POSTGRES_DB_NAME)
    sql = postgres(`postgres://${user}:${password}@${host}:${port}/${database}`)
  })

  on('after:run', async () => {
    await sql.end()
  })

  return config
}

const hashSha256 = (message: string) => {
  const messageBuffer = Buffer.from(message)
  const hash = crypto.createHash('sha256').update(messageBuffer).digest('hex')
  return hash
}
