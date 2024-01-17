/* eslint-disable no-console */

// Purpose: Run migration vs database in /backend/.env
// Howto
// npx ts-node scripts/run-mirgration/script.ts

import { migrate } from 'drizzle-orm/mysql2/migrator'
import { drizzle } from 'drizzle-orm/mysql2'
import * as mysql from 'mysql2/promise'
import * as dotenv from 'dotenv'

dotenv.config({ path: './.env' }) // Info: .env needs to read before imports
dotenv.config({ path: './backend/.env' }) // Info: .env needs to read before imports

import * as schema from '@backend/database/drizzle/schema'
import { USE_DRIZZLE, DB_CREDENTIALS } from '@backend/constants'

import { MIGRATIONS_FOLDER } from './drizzle.config'

const run = async () => {
   const connection = await mysql.createConnection({
     ...DB_CREDENTIALS,
     multipleStatements: true,
  })

  const db = drizzle(connection, { mode: 'default', schema })

  // This will run migrations on the database, skipping the ones already applied
  console.info('Running DB Migration')
  console.info(`Host:      ${DB_CREDENTIALS.host}:${DB_CREDENTIALS.port}`)
  console.info(`User:      ${DB_CREDENTIALS.user}`)
  console.info(`Database:  ${DB_CREDENTIALS.database}`)
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })

  // Don't forget to close the connection, otherwise the script will hang
  await connection.end()
  console.info('✅ Done')
}

if (USE_DRIZZLE) {
  run()
}
