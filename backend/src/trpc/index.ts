import { router, createContext } from './trpc.js'
import { bulkWithdrawRouter } from './router/tipcards/bulkWithdraw.js'
import { cardRouter } from './router/tipcards/card.js'
import { profileRouter } from './router/tipcards/profile.js'
import { setRouter } from './router/tipcards/set.js'
import { statisticsRouter } from './router/tipcards/statistics.js'

export const appRouter = router({
  bulkWithdraw: bulkWithdrawRouter,
  card: cardRouter,
  profile: profileRouter,
  set: setRouter,
  statistics: statisticsRouter,
})

export type AppRouter = typeof appRouter

export { createContext }
