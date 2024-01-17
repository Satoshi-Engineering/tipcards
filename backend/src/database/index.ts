import Database from '@backend/database/drizzle/Database'
import { getClient, resetClient } from '@backend/database/redis/client'
import { USE_DRIZZLE } from '@backend/constants'

let initDatabase: (onConnectionEnded?: () => void) => Promise<unknown> = async () => await getClient()
if (USE_DRIZZLE) {
  initDatabase = async (onConnectionEnded?: () => void) => {
    if (onConnectionEnded == null) {
      throw new Error('Missing onConnectionEnded hook for drizzle database init!')
    }
    await Database.init(onConnectionEnded)
  }
}

let closeDatabaseConnections: () => Promise<unknown> = async () => resetClient()
if (USE_DRIZZLE) {
  closeDatabaseConnections = async () => await Database.closeConnectionIfExists()
}

export {
  initDatabase,
  closeDatabaseConnections,
}
