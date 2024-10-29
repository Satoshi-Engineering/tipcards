import { BulkWithdrawId } from '@shared/data/trpc/BulkWithdraw.js'
import { CardHash } from '@shared/data/trpc/Card.js'
import { SetDeprecatedId } from '@shared/data/trpc/Set.js'

import {
  lockCard, safeReleaseCard,
  lockCards, safeReleaseCards,
} from '@backend/services/inMemoryCardLock.js'
import BulkWithdrawDeprecated from '@backend/domain/BulkWithdrawDeprecated.js'
import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

import { publicProcedure } from '../../trpc.js'

export const handleCardLockForSingleCard = publicProcedure
  .input(CardHash)
  .use(async ({ input, next }) => {
    const lock = await lockCard(input.hash)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCard(input.hash, lock)
    }
  })

export const handleCardLockForMultipleCards = publicProcedure
  .input(CardHash.shape.hash.array())
  .use(async ({ input, next }) => {
    const locks = await lockCards(input)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(locks)
    }
  })

export const handleCardLockForBulkWithdraw = publicProcedure
  .input(BulkWithdrawId)
  .use(async ({ input, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromId(input.id)
    const locks = await lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(locks)
    }
  })

export const handleCardLockForBulkWithdrawByCardHash = publicProcedure
  .input(CardHash)
  .use(async ({ input, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromCardHash(input.hash)
    const locks = await lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(locks)
    }
  })

export const handleCardLockForSet = publicProcedure
  .input(SetDeprecatedId)
  .use(async ({ input, next }) => {
    const cards = await CardCollectionDeprecated.fromSetId(input.id)
    const locks = await lockCards(cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(locks)
    }
  })
