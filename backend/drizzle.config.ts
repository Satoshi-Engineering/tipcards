import { dirname } from 'path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'drizzle-kit'

import './src/initEnv.js' // Needed for the drizzle-kit generate:mysql command

export const SCHEMA_PATH = `${dirname(fileURLToPath(import.meta.url))}/src/database/schema/*`

export const MIGRATIONS_FOLDER = './backend/database/drizzle/migrations'

// read process.env directly and not from constants, as this file is also used for drizzle-kit
export const DB_CREDENTIALS = {
  host: String(process.env.POSTGRES_HOST),
  user: String(process.env.POSTGRES_USER),
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  password: String(process.env.POSTGRES_PASSWORD),
  database: String(process.env.POSTGRES_DB_NAME),
}

export default defineConfig({
  schema: SCHEMA_PATH,
  out: MIGRATIONS_FOLDER,
  dialect: 'postgresql',
  dbCredentials: DB_CREDENTIALS,
})
