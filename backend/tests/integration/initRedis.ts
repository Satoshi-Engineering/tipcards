import './initEnv'

import type { BulkWithdraw } from '@backend/database/redis/data/BulkWithdraw'
import type { Card } from '@backend/database/redis/data/Card'
import type { Set } from '@backend/database/redis/data/Set'

import {
  createCard, deleteCard,
  createSet, deleteSet,
  deleteBulkWithdraw as deleteBulkWithdrawRedis,
} from '../../src/services/database'

export const initCard = async (card: Card) => {
  await safeCall(() => deleteCard(card))
  await createCard(card)
}

export const initSet = async (set: Set) => {
  await safeCall(() => deleteSet(set))
  await createSet(set)
}

export const deleteBulkWithdraw = async (bulkWithdraw: BulkWithdraw) => {
  await safeCall(() => deleteBulkWithdrawRedis(bulkWithdraw))
}

const safeCall = async (callback: CallableFunction) => {
  try {
    await callback()
  } catch (error) {
    // linter complains about empty block
  }
}
