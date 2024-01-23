import { getClient } from './client'

import { ErrorCode } from '@shared/data/Errors'

import { BulkWithdraw } from '@backend/database/redis/data/BulkWithdraw'
import { Card } from '@backend/database/redis/data/Card'
import { User } from '@backend/database/redis/data/User'
import { Set } from '@backend/database/redis/data/Set'
import { REDIS_BASE_PATH } from '@backend/constants'

/** @throws */
export const getAllCardHashes = async (): Promise<string[]> => {
  const client = await getClient()
  const keys = await client.keys('*')
  const hashes: string[] = []
  keys.forEach((hash) => {
    const matches = new RegExp(`^${REDIS_BASE_PATH}:cardsByHash:([A-z0-9]+):data$`).exec(hash)
    if (matches == null) {
      return
    }
    hashes.push(matches[1])
  })
  return hashes
}

/** @throws */
export const getAllUsers = async (): Promise<User[]> => {
  const client = await getClient()
  const users: User[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:usersById:*:data`,
    })
  ) {
    const userResult = await client.json.get(key)
    try {
      users.push(User.parse(userResult))
    } catch (error) {
      console.error(ErrorCode.ZodErrorParsingUserByKey, key, error)
    }
  }
  return users
}

/** @throws */
export const getAllCards = async (): Promise<Card[]> => {
  const client = await getClient()
  const cards: Card[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:cardsByHash:*:data`,
    })
  ) {
    const cardResult = await client.json.get(key)
    try {
      cards.push(Card.parse(cardResult))
    } catch (error) {
      console.error(ErrorCode.ZodErrorParsingCardByKey, key, error)
    }
  }
  return cards
}

/** @throws */
export const getAllSets = async (): Promise<Set[]> => {
  const client = await getClient()
  const sets: Set[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:setsById:*:data`,
    })
  ) {
    const setResult = await client.json.get(key)
    try {
      sets.push(Set.parse(setResult))
    } catch (error) {
      console.error(ErrorCode.ZodErrorParsingSetByKey, key, error)
    }
  }
  return sets
}

/**@throws */
export const getAllBulkWithdraws = async (): Promise<BulkWithdraw[]> => {
  const client = await getClient()
  const bulkWithdraws: BulkWithdraw[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:bulkWithdrawsById:*:data`,
    })
  ) {
    const bulkWithdrawResult = await client.json.get(key)
    try {
      bulkWithdraws.push(BulkWithdraw.parse(bulkWithdrawResult))
    } catch (error) {
      console.error(ErrorCode.ZodErrorParsingBulkWithdrawByKey, key, error)
    }
  }
  return bulkWithdraws
}
