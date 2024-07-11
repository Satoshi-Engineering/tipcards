import * as queriesDrizzle from '@backend/database/drizzle/queriesRedis.js'
import * as queriesRedis from '@backend/database/redis/queries.js'
import { USE_DRIZZLE } from '@backend/constants.js'

let queries = queriesRedis
if (USE_DRIZZLE) {
  queries = queriesDrizzle
}

const {
  lockCardByHash,
  releaseCardByHash,
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
  getBulkWithdrawByCardHash,
  updateBulkWithdraw,
  deleteBulkWithdraw,
  getAllLandingPages,
} = queries

export {
  lockCardByHash,
  releaseCardByHash,
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
  getBulkWithdrawByCardHash,
  updateBulkWithdraw,
  deleteBulkWithdraw,
  getAllLandingPages,
}
