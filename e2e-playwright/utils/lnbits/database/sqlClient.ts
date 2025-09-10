import postgres, { type Sql } from 'postgres'

const host = 'postgres.lnbits.tipcards.localhost'
const port = '5433'
const user = 'lnbits'
const password = 'gobrrrrrr'
const database = 'lnbits'

let sqlClient: Sql

export default () => {
  if (!sqlClient) {
    sqlClient = postgres(`postgres://${user}:${password}@${host}:${port}/${database}`)
  }
  return sqlClient
}
