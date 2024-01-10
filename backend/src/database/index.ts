import Database from '@backend/database/drizzle/Database'
import { getClient, resetClient } from '@backend/database/redis/client'

let initDatabase: () => Promise<unknown>  = async () => await getClient()
let closeDatabaseConnections: () => Promise<unknown> = async () => resetClient()

if (process.env.USE_DRIZZLE === '1') {
  initDatabase = async () => await Database.getDatabase()
  closeDatabaseConnections = async () => await Database.closeConnectionIfExists()
}

export {
  initDatabase,
  closeDatabaseConnections,
}
