import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: './backend/.env' }) // Needed for the drizzle-kit generate:mysql command

export const SCHEMA_PATH = './backend/src/database/drizzle/schema/*'

export const MIGRATIONS_FOLDER = './backend/database/drizzle/migrations'

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
