import type { User, Profile } from '@backend/database/schema/index.js'
import type { DataObjects } from '@backend/database/batchQueries.js'
import type { User as UserRedis } from '@backend/database/deprecated/data/User.js'

import { unixTimestampToDate } from './dateHelpers.js'

export const getDrizzleDataObjectsForRedisUser = async (userRedis: UserRedis): Promise<DataObjects> => {
  const user: User = {
    id: userRedis.id,
    lnurlAuthKey: userRedis.lnurlAuthKey,
    created: unixTimestampToDate(userRedis.created),
    permissions: userRedis.permissions,
  }
  const profile: Profile = {
    user: userRedis.id,
    accountName: userRedis.profile.accountName,
    displayName: userRedis.profile.displayName,
    email: userRedis.profile.email,
  }

  return toDataObjects({
    user,
    profile,
  })
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
