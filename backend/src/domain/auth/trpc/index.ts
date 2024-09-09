import { router, createContext } from './trpc.js'
import { authRouter } from './router/auth.js'
import { lnurlAuthRouter } from './router/lnurlAuth.js'

export const appRouter = router({
  lnurlAuth: lnurlAuthRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter

export { createContext }
