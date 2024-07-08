import { router, createContext } from './trpc'
import { bulkWithdrawRouter } from './router/bulkWithdraw'
import { cardRouter } from './router/card'
import { setRouter } from './router/set'
import { statisticsRouter } from './router/statistics'

export const appRouter = router({
  bulkWithdraw: bulkWithdrawRouter,
  card: cardRouter,
  set: setRouter,
  statistics: statisticsRouter,
})

export type AppRouter = typeof appRouter

export { createContext }
