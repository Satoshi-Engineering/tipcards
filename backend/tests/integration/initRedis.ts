import './initEnv'

import type { BulkWithdraw } from '@shared/data/redis/BulkWithdraw'
import type { Card } from '@shared/data/redis/Card'
import type { Set } from '@shared/data/redis/Set'

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
