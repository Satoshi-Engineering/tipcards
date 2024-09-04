import { createExpressMiddleware } from '@trpc/server/adapters/express'
import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import assets from './api/assets.js'
import auth from './api/auth.js'
import bulkWithdraw from './api/bulkWithdraw.js'
import card from './api/card.js'
import cardLogos from './api/cardLogos.js'
import cypress from './api/cypress.js'
import dummy from './api/dummy.js'
import invoice from './api/invoice.js'
import landingPages from './api/landingPages.js'
import lnurl from './api/lnurl.js'
import lnurlp from './api/lnurlp.js'
import set from './api/set.js'
import withdraw from './api/withdraw.js'
import { appRouter } from './trpc/index.js'
import { createContext } from './trpc/trpc.js'
import { mapApplicationErrorToTrpcError } from './trpc/errorHandling.js'
import corsOptions from './services/corsOptions.js'
import xstAttack from './xstAttack.js'

const app = express()
app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(helmet())
app.use(xstAttack())
app.use('/api/assets', assets)
app.use('/api/auth', auth)
app.use('/api/bulkWithdraw', bulkWithdraw)
app.use('/api/card', card)
app.use('/api/cardLogos', cardLogos)
app.use('/api/dummy', dummy)
app.use('/api/invoice', invoice)
app.use('/api/landingPages', landingPages)
app.use('/api/lnurl', lnurl)
app.use('/api/lnurlp', lnurlp)
app.use('/api/set', set)
app.use('/api/withdraw', withdraw)
app.use('/api/cypress', cypress)
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: (opts) => {
      mapApplicationErrorToTrpcError(opts.error)
    },
  }),
)

export default app
