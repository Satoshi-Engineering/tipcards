import { createClient, SchemaFieldTypes } from 'redis'
import type { RedisClientType, RediSearchSchema, RedisDefaultModules, RedisFunctions, RedisScripts } from 'redis'

import { REDIS_BASE_PATH } from '../constants'
import type { Card } from '../../../src/data/Card'
import type { Set } from '../../../src/data/Set'
import { createUserId, type User } from '../../../src/data/User'
import { ImageType, type ImageMeta } from '../../../src/data/Image'
import type { LandingPage } from '../../../src/data/LandingPage'

const REDIS_CONNECT_TIMEOUT = 3 * 1000
const INDEX_USER_BY_LNURL_AUTH_KEY = `idx:${REDIS_BASE_PATH}:userByLnurlAuthKey`
const INDEX_SETS_BY_USER_ID = `idx:${REDIS_BASE_PATH}:setsByUserId`

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

export const getSetsByUserId = async (userId: string): Promise<Set[]> => {
  const client = await getClient()
  const result = await client.ft.search(
    INDEX_SETS_BY_USER_ID,
    `@userId:${userId.replace(/-/g, '')}`,
    { LIMIT: { from: 0, size: 1000 } },
  )
  if (result.total > result.documents.length) {
    console.error(`User ${userId} has more than ${result.documents.length} sets. This is currently not supported.`)
  }
  return result.documents
    .filter(({ id }) => new RegExp(`^${REDIS_BASE_PATH}:setsById:[A-z0-9-]+:data$`).test(id))
    .map(({ value }) => value as Set)
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

/**
 * @param user User
 * @throws
 */
export const createUser = async (user: User): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:usersById:${user.id}:data`)
  if (exists) {
    throw new Error('User already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:usersById:${user.id}:data`, '$', user)
}

/**
 * @param userId string
 * @throws
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const client = await getClient()
  const user: User | null = await client.json.get(`${REDIS_BASE_PATH}:usersById:${userId}:data`) as User | null
  return user
}

/**
 * @param lnurlAuthKey string
 * @throws
 */
export const getUserByLnurlAuthKey = async (lnurlAuthKey: string): Promise<User | null> => {
  const client = await getClient()
  const result = await client.ft.search(INDEX_USER_BY_LNURL_AUTH_KEY, `@lnurlAuthKey:${lnurlAuthKey}`)
  const user = result.documents
    .filter(({ id }) => new RegExp(`^${REDIS_BASE_PATH}:usersById:[A-z0-9-]+:data$`).test(id))
    .map(({ value }) => value as User)
    .find((user) => user.lnurlAuthKey === lnurlAuthKey)
  if (user == null) {
    return null
  }
  return user
}

/**
 * @param lnurlAuthKey string
 * @throws
 */
export const getUserByLnurlAuthKeyOrCreateNew = async (lnurlAuthKey: string): Promise<User> => {
  let user = await getUserByLnurlAuthKey(lnurlAuthKey)
  if (user != null) {
    return user
  }
  user = {
    id: createUserId(),
    lnurlAuthKey,
    created: Math.floor(+ new Date() / 1000),
  }
  await createUser(user)
  return user
}

/**
 * @param image ImageMeta
 * @throws
 */
export const createImageMeta = async (image: ImageMeta): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:imagesById:${image.id}:meta`)
  if (exists) {
    throw new Error('Image already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:imagesById:${image.id}:meta`, '$', image)
}

/**
 * @param imageId string
 * @throws
 */
export const getImageMeta = async (imageId: string): Promise<ImageMeta | null> => {
  const client = await getClient()
  const image: ImageMeta | null = await client.json.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:meta`) as ImageMeta | null
  return image
}

/**
 * @param imageId string
 * @throws
 */
export const getImage = async (imageId: string): Promise<Buffer | string | null> => {
  const imageMeta = await getImageMeta(imageId)
  if (imageMeta == null) {
    return null
  }
  const client = await getClient()
  let image: Buffer | string | null = null
  if (imageMeta.type === ImageType.Svg) {
    image = await client.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:data`) as string | null
  } else if (imageMeta.type === ImageType.Png) {
    const data = await client.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:data`) as string | null
    if (data != null) {
      image = Buffer.from(data, 'base64')
    }
  }
  return image
}

/**
 * @param imageId string
 * @throws
 */
export const getImageAsString = async (imageId: string): Promise<string | null> => {
  const client = await getClient()
  const image: string | null = await client.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:data`) as string | null
  return image
}

/**
 * @param imageId string
 * @throws
 */
export const storeImageString = async (imageMeta: ImageMeta, image: string): Promise<void> => {
  const client = await getClient()
  await client.set(`${REDIS_BASE_PATH}:imagesById:${imageMeta.id}:data`, image)
}

/**
 * @param landingPage LandingPage
 * @throws
 */
export const createLandingPage = async (landingPage: LandingPage): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:landingPagesById:${landingPage.id}:data`)
  if (exists) {
    throw new Error('Landing page already exists.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:landingPagesById:${landingPage.id}:data`, '$', landingPage)
}

/**
 * @param landingPage LandingPage
 * @throws
 */
export const updateLandingPage = async (landingPage: LandingPage): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:landingPagesById:${landingPage.id}:data`)
  if (!exists) {
    throw new Error('Landing page doesn\'t exist.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:landingPagesById:${landingPage.id}:data`, '$', landingPage)
}

/**
 * @param landingPageId string
 * @throws
 */
export const getLandingPage = async (landingPageId: string): Promise<LandingPage | null> => {
  const client = await getClient()
  const landingPage: LandingPage | null = await client.json.get(`${REDIS_BASE_PATH}:landingPagesById:${landingPageId}:data`) as LandingPage | null
  return landingPage
}
