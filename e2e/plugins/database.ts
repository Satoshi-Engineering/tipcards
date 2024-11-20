/// <reference types="cypress" />

import crypto, { randomUUID } from 'crypto'
import postgres from 'postgres'

import { getJwtPayload } from '../lib/jwtHelpers'

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

    'db:logoutAllDevices': async ({ refreshToken }: { refreshToken: string }) => {
      const payload = await getJwtPayload({ refreshToken })
      const userId = payload.userId as string
      await sql`DELETE FROM public."AllowedRefreshTokens" WHERE "user"=${userId};`
      await sql`DELETE FROM public."AllowedSession" WHERE "user"=${userId};`
      return userId
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
