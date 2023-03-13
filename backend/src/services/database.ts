import { createClient } from 'redis'
import type { RedisClientType, RedisDefaultModules, RedisFunctions, RedisScripts } from 'redis'

import { REDIS_BASE_PATH } from '../constants'
import type { Card } from '../../../src/data/Card'
import type { Set } from '../../../src/data/Set'

const REDIS_CONNECT_TIMEOUT = 3 * 1000

type Resolve = (value?: unknown) => void
let client: RedisClientType<RedisDefaultModules, RedisFunctions, RedisScripts> | null
let connecting = false
let callbacks: Resolve[] = []
export const resetClient = () => {
  client = null
  connecting = false
  callbacks.forEach(resolve => resolve())
  callbacks = []
}
export const getClient = async () => {
  if (client != null) {
    return client
  }
  if (connecting) {
    await new Promise(resolve => callbacks.push(resolve))
    if (client == null) {
      throw new Error('Unable to connect to redis server.')
    }
    return client
  }
  connecting = true

  const newClient = createClient({ url: `redis://:${process.env.REDIS_PASSPHRASE}@127.0.0.1:6379` })
  newClient.on('end', resetClient)
  newClient.on('error', async (error) => {
    // redis is automatically trying to re-connect. let him try for some time
    if (error?.errno === -111 && connecting) {
      return
    }
    console.error('\nRedis Client Error:', error)
    try {
      await newClient.quit()
    } catch (error: unknown) {
      // we discard the client now, so no need to handle errors on disconnecting
    }
    resetClient()
  })

  // abort connecting after set timeout to prevent endless waiting (e.g. for FE requests)
  setTimeout(async () => {
    if (client == newClient) {
      return
    }
    try {
      await newClient.quit()
      resetClient()
    } catch (error) {
      // we discard the client now, so no need to handle errors on disconnecting
    }
  }, REDIS_CONNECT_TIMEOUT)

  try {
    await newClient.connect()
  } catch (error) {
    resetClient()
    throw new Error('Unable to connect to redis server.')
  }

  client = newClient
  connecting = false
  callbacks.forEach(resolve => resolve())
  callbacks = []
  return client
}

/**
 * @param cardHash string
 * @throws
 */
export const getCardByHash = async (cardHash: string): Promise<Card | null> => {
  const client = await getClient()
  const card: Card | null = await client.json.get(`${REDIS_BASE_PATH}:cardsByHash:${cardHash}:data`) as Card | null
  return card
}

/**
 * @param card Card
 * @throws
 */
export const createCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (exists) {
    throw new Error('Card already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`, '$', card)
}

/**
 * @param card Card
 * @throws
 */
export const updateCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (!exists) {
    throw new Error('Card doesn\'t exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`, '$', card)
}

/**
 * @param card Card
 * @throws
 */
export const deleteCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (!exists) {
    throw new Error('Card doesn\'t exists.')
  }
  await client.del(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
}

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

/**
 * @param setId string
 * @throws
 */
export const getSetById = async (setId: string): Promise<Set | null> => {
  const client = await getClient()
  const set: Set | null = await client.json.get(`${REDIS_BASE_PATH}:setsById:${setId}:data`) as Set | null
  return set
}

/**
 * @param set Set
 * @throws
 */
export const createSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
  if (exists) {
    throw new Error('Set already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:setsById:${set.id}:data`, '$', set)
}

/**
 * @param set Set
 * @throws
 */
export const updateSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
  if (!exists) {
    throw new Error('Set doesn\'t exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:setsById:${set.id}:data`, '$', set)
}

export const deleteSet = async (set: Set): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
  if (!exists) {
    throw new Error('Set doesn\'t exists.')
  }
  await client.del(`${REDIS_BASE_PATH}:setsById:${set.id}:data`)
}
