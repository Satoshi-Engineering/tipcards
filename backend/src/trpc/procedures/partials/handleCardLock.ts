import { CardHash } from '@shared/data/trpc/Card'
import { publicProcedure } from '../../trpc'
import { lockCard, safeReleaseCard } from '@backend/services/databaseCardLock'

export default publicProcedure
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
