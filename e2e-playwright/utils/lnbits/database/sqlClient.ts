import postgres, { type Sql } from 'postgres'

const host = '127.0.0.1'
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
