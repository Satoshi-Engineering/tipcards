import * as queriesDrizzle from '@backend/database/drizzle/queriesRedis'
import * as queriesRedis from '@backend/database/redis/queries'
import { USE_DRIZZLE } from '@backend/constants'

let queries = queriesRedis
if (USE_DRIZZLE) {
  queries = queriesDrizzle
}

const {
  getCardByHash,
  createCard,
  updateCard,
  deleteCard,
  getSetById,
  getSetsByUserId,
  createSet,
  updateSet,
  deleteSet,
  createUser,
  updateUser,
  getUserById,
  getUserByLnurlAuthKey,
  getAllUsers,
  getUserByLnurlAuthKeyOrCreateNew,
  initUserFromAccessTokenPayload,
  getImageMeta,
  getImageAsString,
  getLandingPage,
  createBulkWithdraw,
  getBulkWithdrawById,
  updateBulkWithdraw,
  deleteBulkWithdraw,
  getAllBulkWithdraws,
  getAllLandingPages,
} = queries

export {
  getCardByHash,
  createCard,
  updateCard,
  deleteCard,
  getSetById,
  getSetsByUserId,
  createSet,
  updateSet,
  deleteSet,
  createUser,
  updateUser,
  getUserById,
  getUserByLnurlAuthKey,
  getAllUsers,
  getUserByLnurlAuthKeyOrCreateNew,
  initUserFromAccessTokenPayload,
  getImageMeta,
  getImageAsString,
  getLandingPage,
  createBulkWithdraw,
  getBulkWithdrawById,
  updateBulkWithdraw,
  deleteBulkWithdraw,
  getAllBulkWithdraws,
  getAllLandingPages,
}
