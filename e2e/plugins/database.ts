/// <reference types="cypress" />

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
      const id = String(payload.id)
      await sql`
        DELETE FROM public."AllowedRefreshTokens" WHERE user=${id};
      `

      return id
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
