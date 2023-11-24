import { User } from '@backend/database/drizzle/schema'
import type { DataObjects } from '@backend/database/drizzle/batchQueries'
import type { User as UserRedis } from '@backend/database/redis/data/User'

import { unixTimestampToDate } from './dateHelpers'

export const getDrizzleDataObjectsForRedisUser = async (userRedis: UserRedis): Promise<{
  insertOrUpdate: DataObjects,
  delete: DataObjects,
}> => {
  const user: User = {
    id: userRedis.id,
    lnurlAuthKey: userRedis.lnurlAuthKey,
    created: unixTimestampToDate(userRedis.created),
    permissions: JSON.stringify(userRedis.permissions),
  }
  return {
    insertOrUpdate: toDataObjects({
      user,
    }),
    delete: toDataObjects({}),
  }
}

const toDataObjects = ({
  user,
}: {
  user?: User | null,
}): DataObjects => {
  const dataObjects: DataObjects = {}
  if (user != null) {
    dataObjects.users = [user]
  }
  return dataObjects
}
