import { BulkWithdrawId } from '@shared/data/trpc/BulkWithdraw.js'
import { CardHash } from '@shared/data/trpc/Card.js'
import { SetId } from '@shared/data/trpc/Set.js'

import {
  lockCard, safeReleaseCard,
  lockCards, safeReleaseCards,
} from '@backend/services/databaseCardLock.js'
import BulkWithdrawDeprecated from '@backend/domain/BulkWithdrawDeprecated.js'
import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

import { publicProcedure } from '../../trpc.js'

export const handleCardLockForSingleCard = publicProcedure
  .input(CardHash)
  .use(async ({ input, next }) => {
    const lockValue = await lockCard(input.hash)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCard(input.hash, lockValue)
    }
  })

export const handleCardLockForMultipleCards = publicProcedure
  .input(CardHash.shape.hash.array())
  .use(async ({ input, next }) => {
    const lockValues = await lockCards(input)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })

export const handleCardLockForBulkWithdraw = publicProcedure
  .input(BulkWithdrawId)
  .use(async ({ input, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromId(input.id)
    const lockValues = await lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })

export const handleCardLockForBulkWithdrawByCardHash = publicProcedure
  .input(CardHash)
  .use(async ({ input, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromCardHash(input.hash)
    const lockValues = await lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })

export const handleCardLockForSet = publicProcedure
  .input(SetId)
  .use(async ({ input, next }) => {
    const cards = await CardCollectionDeprecated.fromSetId(input.id)
    const lockValues = await lockCards(cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })
