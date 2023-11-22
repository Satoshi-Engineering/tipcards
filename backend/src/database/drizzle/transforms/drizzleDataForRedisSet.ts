
import {
  Set, SetSettings,
  UserCanUseSet,
} from '@backend/database/drizzle/schema'
import type { DataObjects } from '@backend/database/drizzle/batchQueries'
import type { Set as SetRedis } from '@backend/database/redis/data/Set'

import { unixTimestampOrNullToDate, unixTimestampToDate } from './dateHelpers'

export const getDrizzleDataObjectsForRedisSet = (setRedis: SetRedis): DataObjects => {
  const set: Set = {
    id: setRedis.id,
    created: unixTimestampToDate(setRedis.created),
    changed: unixTimestampOrNullToDate(setRedis.date) || new Date(),
  }
  const setSettings = getDrizzleSetSettingsForRedisSet(setRedis)
  const userCanUseSet = getUserCanUseSetForRedisSet(setRedis)
  return setObjectsToDataObjects({
    set,
    setSettings,
    userCanUseSet,
  })
}

const getDrizzleSetSettingsForRedisSet = (setRedis: SetRedis): SetSettings | null => {
  if (setRedis.settings == null) {
    return null
  }
  return {
    set: setRedis.id,
    name: setRedis.settings.setName,
    numberOfCards: setRedis.settings.numberOfCards,
    cardHeadline: setRedis.settings.cardHeadline,
    cardCopytext: setRedis.settings.cardCopytext,
    image: setRedis.settings.cardsQrCodeLogo,
    landingPage: setRedis.settings.landingPage || 'core',
  }
}

const getUserCanUseSetForRedisSet = (setRedis: SetRedis): UserCanUseSet | null => {
  if (setRedis.userId == null) {
    return null
  }
  return {
    user: setRedis.userId,
    set: setRedis.id,
    canEdit: true,
  }
}

const setObjectsToDataObjects = ({
  set,
  setSettings,
  userCanUseSet,
}: {
  set: Set,
  setSettings: SetSettings | null,
  userCanUseSet: UserCanUseSet | null,
}): DataObjects => {
  const dataObjects: DataObjects = {
    sets: [set],
  }
  if (setSettings != null) {
    dataObjects.setSettings = [setSettings]
  }
  if (userCanUseSet != null) {
    dataObjects.usersCanUseSets = [userCanUseSet]
  }
  return dataObjects
}
