import type { User, Profile, AllowedRefreshTokens } from '@backend/database/schema/index.js'
import type { DataObjects } from '@backend/database/batchQueries.js'
import type { User as UserRedis } from '@backend/database/deprecated/data/User.js'
import hashSha256 from '@backend/services/hashSha256.js'

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
  const allowedRefreshTokens = drizzleAllowedRefreshTokensListFromRedisUser(userRedis)

  return toDataObjects({
    user,
    profile,
    allowedRefreshTokens,
  })
}

const toDataObjects = ({
  user,
  profile,
  allowedRefreshTokens,
}: {
  user?: User | null,
  profile?: Profile | null,
  allowedRefreshTokens?: AllowedRefreshTokens[],
}): DataObjects => {
  const dataObjects: DataObjects = {}
  if (user != null) {
    dataObjects.users = [user]
  }
  if (profile != null) {
    dataObjects.profiles = [profile]
  }
  if (allowedRefreshTokens != null) {
    dataObjects.allowedRefreshTokens = allowedRefreshTokens
  }
  return dataObjects
}

const drizzleAllowedRefreshTokensListFromRedisUser = (userRedis: UserRedis): AllowedRefreshTokens[] => {
  if (userRedis.allowedRefreshTokens == null) {
    return []
  }
  return userRedis.allowedRefreshTokens.map((tokenPair) => drizzleAllowedRefreshTokensPair(userRedis.id, tokenPair[0], tokenPair[1]))
}

const drizzleAllowedRefreshTokensPair = (userId: User['id'], current: AllowedRefreshTokens['current'], previous?: AllowedRefreshTokens['previous']): AllowedRefreshTokens => ({
  user: userId,
  hash: hashSha256(`${userId}${current}${previous || ''}`),
  current,
  previous: previous || null,
})
