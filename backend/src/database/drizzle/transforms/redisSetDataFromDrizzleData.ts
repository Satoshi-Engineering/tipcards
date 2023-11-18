import type { Set } from '@backend/database/drizzle/schema'
import { Set as SetRedis } from '@backend/database/redis/data/Set'

import { dateToUnixTimestamp } from './dateHelpers'

/** @throws */
export const getRedisSetFromDrizzleSet = async (set: Set): Promise<SetRedis> => {
  return {
    id: set.id,
    settings: null,
    created: dateToUnixTimestamp(set.created),
    date: dateToUnixTimestamp(set.changed),
  
    userId: null,
  
    text: '',
    note: '',
    invoice: null,
  }
}
