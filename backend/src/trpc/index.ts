import { router, createContext } from './trpc.js'
import { bulkWithdrawRouter } from './router/bulkWithdraw.js'
import { cardRouter } from './router/card.js'
import { profileRouter } from './router/profile.js'
import { setRouter } from './router/set.js'
import { statisticsRouter } from './router/statistics.js'

export const appRouter = router({
  bulkWithdraw: bulkWithdrawRouter,
  card: cardRouter,
  profile: profileRouter,
  set: setRouter,
  statistics: statisticsRouter,
})

export type AppRouter = typeof appRouter

export { createContext }
