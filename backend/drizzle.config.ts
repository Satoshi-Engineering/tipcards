import type { Config } from 'drizzle-kit'

import './src/initEnv' // Needed for the drizzle-kit generate:mysql command

export const SCHEMA_PATH = './backend/src/database/drizzle/schema/*'

export const MIGRATIONS_FOLDER = './backend/database/drizzle/migrations'

// read process.env directly and not from constants, as this file is also used for drizzle-kit
export const DB_CREDENTIALS = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
}

export default {
  schema: SCHEMA_PATH,
  out: MIGRATIONS_FOLDER,
  driver: 'mysql2',
  dbCredentials: DB_CREDENTIALS,
} as Config
