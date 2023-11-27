import { User, Profile } from '@backend/database/drizzle/schema'
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
  const profile: Profile = {
    user: userRedis.id,
    accountName: userRedis.profile.accountName,
    displayName: userRedis.profile.displayName,
    email: userRedis.profile.email,
  }
  return {
    insertOrUpdate: toDataObjects({
      user,
      profile,
    }),
    delete: toDataObjects({}),
  }
}

const toDataObjects = ({
  user,
  profile,
}: {
  user?: User | null,
  profile?: Profile | null,
}): DataObjects => {
  const dataObjects: DataObjects = {}
  if (user != null) {
    dataObjects.users = [user]
  }
  if (profile != null) {
    dataObjects.profiles = [profile]
  }
  return dataObjects
}
