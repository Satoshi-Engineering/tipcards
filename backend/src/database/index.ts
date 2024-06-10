import Database from '@backend/database/drizzle/Database'
import { getClient, resetClient } from '@backend/database/redis/client'
import { USE_DRIZZLE } from '@backend/constants'

let initDatabase: () => Promise<unknown> = async () => await getClient()
if (USE_DRIZZLE) {
  initDatabase = async () => await Database.init()
}

let closeDatabaseConnections: () => Promise<unknown> = async () => await resetClient()
if (USE_DRIZZLE) {
  closeDatabaseConnections = async () => await Database.closeConnectionIfExists()
}

export {
  initDatabase,
  closeDatabaseConnections,
}
