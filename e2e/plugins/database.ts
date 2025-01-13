/// <reference types="cypress" />

import type { SetDto } from '@shared/data/trpc/SetDto'

import crypto, { randomUUID } from 'crypto'
import postgres from 'postgres'

import { getJwtPayload } from '../lib/jwtHelpers'
import {
  createSet001,
  createSet002,
  createSet005,
  createSet007,
  create100TestSets,
  createSetsWithSetFunding,
} from './database/createSets'

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
      const payload = await getJwtPayload({ jwt: refreshToken })
      const userId = payload.userId as string
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

    'db:create100TestSets': async ({ userId }: { userId: string }): Promise<SetDto[]> => {
      const sets = await create100TestSets(sql, userId)
      return sets
    },

    'db:createSet1': async ({ userId }: { userId: string }): Promise<SetDto> => {
      const set = await createSet001(sql, userId)
      return set
    },

    'db:createSet2': async ({ userId }: { userId: string }): Promise<SetDto> => {
      const set = await createSet002(sql, userId)
      return set
    },

    'db:createSet5': async ({ userId }: { userId: string }): Promise<SetDto> => {
      const set = await createSet005(sql, userId)
      return set
    },

    'db:createSet7': async ({ userId }: { userId: string }): Promise<SetDto> => {
      const set = await createSet007(sql, userId)
      return set
    },

    'db:createSetsWithSetFunding': async ({
      userId,
      numberOfSets,
      numberOfCardsPerSet,
    }: {
      userId: string,
      numberOfSets: number,
      numberOfCardsPerSet: number,
    }): Promise<SetDto[]> => {
      const sets = await createSetsWithSetFunding(
        sql,
        userId,
        numberOfSets,
        numberOfCardsPerSet,
      )
      return sets
    },

    'db:updateSetName': async ({
      setId,
      name,
    }: {
      setId: string,
      name: string,
    }): Promise<null> => {
      await sql`
        UPDATE public."SetSettings"
        SET name = ${name}
        WHERE set = ${setId};
      `
      await sql`
        UPDATE public."Set"
        SET changed = ${new Date()}
        WHERE id = ${setId};
      `
      return null
    },

    'db:setFundedCardToWithdrawn': async (cardHash: string): Promise<null> => {
      const lnurlW = {
        lnbitsId: randomUUID(),
        created: new Date(),
        expiresAt: new Date(),
        withdrawn: new Date(),
        bulkWithdrawId: null,
      }
      await sql`INSERT INTO public."LnurlW" ${ sql(lnurlW) };`
      await sql`UPDATE public."CardVersion" SET "lnurlW" = ${ lnurlW.lnbitsId } WHERE card = ${ cardHash };`

      return null
    },

    'db:setFundedCardToLandingPageViewed': async (cardHash: string): Promise<null> => {
      await sql`UPDATE public."CardVersion" SET "landingPageViewed" = ${ new Date() } WHERE card = ${ cardHash };`

      return null
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
