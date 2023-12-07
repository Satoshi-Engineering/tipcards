import * as queriesDrizzle from '@backend/database/drizzle/queriesRedis'
import * as queriesRedis from '@backend/database/redis/queries'

let queries = queriesRedis
if (process.env.USE_DRIZZLE) {
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
