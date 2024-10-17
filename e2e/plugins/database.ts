/// <reference types="cypress" />

import postgres from 'postgres'

// This function is the entry point for plugins
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  let sql: postgres.Sql

  on('before:run', () => {
    const host = String(process.env.POSTGRES_HOST)
    const user = String(process.env.POSTGRES_USER)
    const port = parseInt(process.env.POSTGRES_PORT || '5432')
    const password = String(process.env.POSTGRES_PASSWORD)
    const database = String(process.env.POSTGRES_DB_NAME)
    sql = postgres(`postgres://${user}:${password}@${host}:${port}/${database}`)
  })

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
  })

  on('after:run', async () => {
    await sql.end()
  })

  return config
}
