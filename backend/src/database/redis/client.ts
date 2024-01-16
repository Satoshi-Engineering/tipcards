import { createClient, SchemaFieldTypes } from 'redis'
import type { RedisClientType, RediSearchSchema, RedisDefaultModules, RedisFunctions, RedisScripts } from 'redis'

import { REDIS_BASE_PATH, REDIS_URL } from '@backend/constants'

export const REDIS_CONNECT_TIMEOUT = 3 * 1000
export const INDEX_USER_BY_LNURL_AUTH_KEY = `idx:${REDIS_BASE_PATH}:userByLnurlAuthKey`
export const INDEX_SETS_BY_USER_ID = `idx:${REDIS_BASE_PATH}:setsByUserId`

const addOrUpdateIndex = async (
  client: RedisClientType<RedisDefaultModules, RedisFunctions, RedisScripts>,
  index: string,
  schema: RediSearchSchema,
  options: object,
) => {
  try {
    await client.ft.dropIndex(index)
  } catch (error) {
    // do nothing, the index doesn't exist
  }
  await client.ft.create(index, schema, options)
}

type Resolve = (value?: unknown) => void
let client: RedisClientType<RedisDefaultModules, RedisFunctions, RedisScripts> | null
let connecting = false
let callbacks: Resolve[] = []

export const resetClient = async () => {
  if (client != null && client.isOpen) {
    try {
      await client.quit()
    } catch (error) {
      console.error('Error while closing redis connection', error)
    }
  }
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

  const newClient = createClient({ url: `redis://:${process.env.REDIS_PASSPHRASE}@${REDIS_URL}` })
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
  const connectTimeout = setTimeout(async () => {
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

  await addOrUpdateIndex(newClient, INDEX_USER_BY_LNURL_AUTH_KEY, {
    '$.lnurlAuthKey': {
      type: SchemaFieldTypes.TEXT,
      AS: 'lnurlAuthKey',
    },
  }, {
    ON: 'JSON',
    PREFIX: `${REDIS_BASE_PATH}:usersById`,
  })
  await addOrUpdateIndex(newClient, INDEX_SETS_BY_USER_ID, {
    '$.userId': {
      type: SchemaFieldTypes.TEXT,
      AS: 'userId',
    },
  }, {
    ON: 'JSON',
    PREFIX: `${REDIS_BASE_PATH}:setsById`,
  })

  client = newClient
  clearTimeout(connectTimeout)
  connecting = false
  callbacks.forEach(resolve => resolve())
  callbacks = []
  return client
}
