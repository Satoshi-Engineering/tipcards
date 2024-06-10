/* eslint-disable no-console */

// Purpose: Run migration vs database in /backend/.env
// Howto
// npx ts-node scripts/run-mirgration/script.ts

import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import '@backend/initEnv' // Info: .env needs to read before imports

import * as schema from '@backend/database/drizzle/schema'
import { USE_DRIZZLE, DB_CREDENTIALS } from '@backend/constants'

import { MIGRATIONS_FOLDER } from './drizzle.config'

const run = async () => {
  // This will run migrations on the database, skipping the ones already applied
  console.info('Running DB Migration')
  console.info(`Host:      ${DB_CREDENTIALS.host}:${DB_CREDENTIALS.port}`)
  console.info(`User:      ${DB_CREDENTIALS.user}`)
  console.info(`Database:  ${DB_CREDENTIALS.database}`)

  const connection = postgres(`postgres://${DB_CREDENTIALS.user}:${DB_CREDENTIALS.password}@${DB_CREDENTIALS.host}:${DB_CREDENTIALS.port}/${DB_CREDENTIALS.database}`)
  const db = drizzle(connection, { schema })
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })

  // Don't forget to close the connection, otherwise the script will hang
  await connection.end()
  console.info('✅ Done')
}

if (USE_DRIZZLE) {
  run()
} else {
  console.info('✅ No migration needed, you are using a different database')
}
