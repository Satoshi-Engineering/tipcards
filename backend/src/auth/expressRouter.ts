import { Router } from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'

import authIndex from '@auth/api/index.js'

import { appRouter } from '@auth/trpc/index.js'
import { createContext } from '@auth/trpc/trpc.js'
import { mapApplicationErrorToTrpcError } from '@auth/trpc/errorHandling.js'

const router = Router()
router.use('/api/', authIndex)
router.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: (opts) => {
      mapApplicationErrorToTrpcError(opts.error)
    },
  }),
)

export default router
