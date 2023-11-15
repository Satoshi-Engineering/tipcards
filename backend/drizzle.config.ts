import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: './backend/.env' }) // Needed for the drizzle-kit generate:mysql command

export default {
  schema: './backend/src/database/drizzle/schema/*',
  out: `./dist/drizzle/${process.env.MYSQL_DB_NAME}-migrations`,
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: parseInt(process.env.MYSQL_PORT),
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
  },
} satisfies Config
