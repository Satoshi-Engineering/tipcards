/* eslint-disable no-console */

// Purpose: Run migration vs database in /backend/.env
// Howto
// npx ts-node scripts/run-mirgration/script.ts

import { migrate } from 'drizzle-orm/mysql2/migrator'
import { drizzle } from 'drizzle-orm/mysql2'
import * as mysql from 'mysql2/promise'
import * as schema from './../../backend/src/database/drizzle/schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: './backend/.env' })

const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306')
const MIGRATIONS_FOLDER = './backend/database/drizzle/migrations'

console.info('Running DB Migration')
console.info(`Host:      ${process.env.MYSQL_HOST}:${MYSQL_PORT}`)
console.info(`User:      ${process.env.MYSQL_USER}`)
console.info(`Database:  ${process.env.MYSQL_DB_NAME}`)

const run = async () => {
   const connection = await mysql.createConnection({
     host: process.env.MYSQL_HOST,
     port: MYSQL_PORT,
     user: process.env.MYSQL_USER,
     password: process.env.MYSQL_PASSWORD,
     database: process.env.MYSQL_DB_NAME,
     multipleStatements: true,
  })

  const db = drizzle(connection, { mode: 'default', schema: schema })

  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })

  // Don't forget to close the connection, otherwise the script will hang
  await connection.end()
}

run()
