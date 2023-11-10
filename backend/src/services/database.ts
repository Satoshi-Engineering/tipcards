import { createClient, SchemaFieldTypes } from 'redis'
import type { RedisClientType, RediSearchSchema, RedisDefaultModules, RedisFunctions, RedisScripts } from 'redis'

import { ErrorCode } from '@shared/data/Errors'

import { BulkWithdraw as ZodBulkWithdraw, type BulkWithdraw } from '@backend/database/redis/data/BulkWithdraw'
import { Card as ZodCard, type Card } from '@backend/database/redis/data/Card'
import { Set as ZodSet, type Set } from '@backend/database/redis/data/Set'
import { User as ZodUser, type User } from '@backend/database/redis/data/User'
import { Type as ImageType, Image as ZodImage, type Image as ImageMeta } from '@backend/database/redis/data/Image'
import { LandingPage as ZodLandingPage, type LandingPage } from '@backend/database/redis/data/LandingPage'
import AlreadyExistsError from '@backend/errors/AlreadyExistsError'
import NotFoundError from '@backend/errors/NotFoundError'
import { REDIS_BASE_PATH, REDIS_URL } from '@backend/constants'

import hashSha256 from './hashSha256'

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

/**
 * @throws ZodError
 * @throws unknown
 */
export const getCardByHash = async (cardHash: string): Promise<Card | null> => {
  const client = await getClient()
  const card = await client.json.get(`${REDIS_BASE_PATH}:cardsByHash:${cardHash}:data`)
  if (card == null) {
    return null
  }
  return ZodCard.parse(card)
}

/**
 * @param card Card
 * @throws
 */
export const createCard = async (card: Card): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`)
  if (exists) {
    throw new Error(`Card ${card.cardHash} already exists.`)
  }
  await client.json.set(`${REDIS_BASE_PATH}:cardsByHash:${card.cardHash}:data`, '$', card)
}

/**
 * @throws unknown
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
  const set = await client.json.get(`${REDIS_BASE_PATH}:setsById:${setId}:data`)
  if (set == null) {
    return null
  }
  return ZodSet.parse(set)
}

export const getSetsByUserId = async (userId: string): Promise<Set[]> => {
  const client = await getClient()
  const result = await client.ft.search(
    INDEX_SETS_BY_USER_ID,
    `@userId:${userId.replace(/-/g, '')}`,
    { LIMIT: { from: 0, size: 1000 } },
  )
  if (result.total > result.documents.length) {
    console.error(ErrorCode.TooManySetsForUser, `User ${userId} has more than ${result.documents.length} sets. This is currently not supported.`)
  }
  return result.documents
    .filter(({ id }) => new RegExp(`^${REDIS_BASE_PATH}:setsById:[A-z0-9-]+:data$`).test(id))
    .map(({ value }) => ZodSet.parse(value))
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
 * @param user User
 * @throws
 */
export const updateUser = async (user: User): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:usersById:${user.id}:data`)
  if (!exists) {
    throw new Error('User doesn\'t exist.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:usersById:${user.id}:data`, '$', user)
}

/**
 * @param userId string
 * @throws
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const client = await getClient()
  const user = await client.json.get(`${REDIS_BASE_PATH}:usersById:${userId}:data`)
  if (user == null) {
    return null
  }
  return ZodUser.parse(user)
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
    .map(({ value }) => {
      try {
        return ZodUser.parse(value)
      } catch (error) {
        console.error(ErrorCode.ZodErrorParsingUserByLnurlAuthKey, lnurlAuthKey, error)
        return null
      }
    })
    .filter((user) => user != null) as User[]
  if (user.length === 0) {
    return null
  } else if (user.length > 1) {
    console.error(ErrorCode.FoundMultipleUsersForLnurlAuthKey, lnurlAuthKey)
    return user.sort((a, b) => a.created - b.created)[0] // select the oldest
  }
  return ZodUser.parse(user[0])
}

/**
 * @throws
 */
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
      users.push(ZodUser.parse(userResult))
    } catch (error) {
      console.error(ErrorCode.ZodErrorParsingUserByKey, key, error)
    }
  }
  return users
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
  const userId = hashSha256(lnurlAuthKey)
  user = ZodUser.parse({
    id: userId,
    lnurlAuthKey,
    created: Math.floor(+ new Date() / 1000),
  })
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
  const image = await client.json.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:meta`)
  if (image == null) {
    return null
  }
  return ZodImage.parse(image)
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
  if (imageMeta.type === ImageType.enum.svg) {
    image = await client.get(`${REDIS_BASE_PATH}:imagesById:${imageId}:data`) as string | null
  } else if (imageMeta.type === ImageType.enum.png) {
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
  const landingPage = await client.json.get(`${REDIS_BASE_PATH}:landingPagesById:${landingPageId}:data`)
  if (landingPage == null) {
    return null
  }
  return ZodLandingPage.parse(landingPage)
}

/**
 * @throws
 */
export const getAllLandingPages = async (): Promise<LandingPage[]> => {
  const client = await getClient()
  const landingPages: LandingPage[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:landingPagesById:*:data`,
    })
  ) {
    const landingPageResult = await client.json.get(key)
    landingPages.push(ZodLandingPage.parse(landingPageResult))
  }
  return landingPages
}

/**
 * @throws AlreadyExistsError
 * @throws unknown
 */
export const createBulkWithdraw = async (bulkWithdraw: BulkWithdraw): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
  if (exists) {
    throw new AlreadyExistsError(`Unable to create bulkWithdraw ${bulkWithdraw.id} in Redis. It already exists.`)
  }
  await client.json.set(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`, '$', bulkWithdraw)
}

/**
 * @throws NotFoundError
 * @throws unknown
 */
export const getBulkWithdrawById = async (id: string): Promise<BulkWithdraw> => {
  const client = await getClient()
  const bulkWithdraw = await client.json.get(`${REDIS_BASE_PATH}:bulkWithdrawById:${id}:data`)
  if (bulkWithdraw == null) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  return ZodBulkWithdraw.parse(bulkWithdraw)
}

/**
 * @throws NotFoundError
 * @throws unknown
 */
export const updateBulkWithdraw = async (bulkWithdraw: BulkWithdraw): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
  if (!exists) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  await client.json.set(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`, '$', bulkWithdraw)
}

/**
 * @throws NotFoundError
 * @throws unknown
 */
export const deleteBulkWithdraw = async (bulkWithdraw: BulkWithdraw): Promise<void> => {
  const client = await getClient()
  const exists = await client.exists(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
  if (!exists) {
    throw new NotFoundError('BulkWithdraw doesn\'t exist.')
  }
  await client.del(`${REDIS_BASE_PATH}:bulkWithdrawById:${bulkWithdraw.id}:data`)
}

/**
 * @throws unknown
 */
export const getAllBulkWithdraws = async (): Promise<BulkWithdraw[]> => {
  const client = await getClient()
  const bulkWithdraws: BulkWithdraw[] = []
  for await (
    const key of client.scanIterator({
      MATCH: `${REDIS_BASE_PATH}:bulkWithdrawById:*:data`,
    })
  ) {
    const bulkWithdraw = await client.json.get(key)
    bulkWithdraws.push(ZodBulkWithdraw.parse(bulkWithdraw))
  }
  return bulkWithdraws
}
