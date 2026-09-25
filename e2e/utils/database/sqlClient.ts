import postgres, { type Sql } from 'postgres'

const host = String(process.env.POSTGRES_HOST)
const port = String(process.env.POSTGRES_PORT)
const user = String(process.env.POSTGRES_USER)
const password = String(process.env.POSTGRES_PASSWORD )
const database = String(process.env.POSTGRES_DB_NAME)

let sqlClient: Sql

export default () => {
  if (!sqlClient) {
    sqlClient = postgres(`postgres://${user}:${password}@${host}:${port}/${database}`)
  }
  return sqlClient
}
