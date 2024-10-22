import proxy from 'express-http-proxy'
import express from 'express'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import {
  EXPRESS_PORT,
  PROXY_PORT,
  WEB_PORT,
} from '@backend/constants.js'
import { LNURL_PORT } from '@auth/constants.js'

const app = express()
app.use('/api', proxy(`localhost:${EXPRESS_PORT}`, {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const host = srcReq.get('host')
    if (typeof host === 'string' && proxyReqOpts.headers != null) {
      proxyReqOpts.headers.host = host
    }
    return proxyReqOpts
  },
  proxyReqPathResolver: (req: express.Request) => `/api${req.url}`,
}))
app.use('/trpc', proxy(`localhost:${EXPRESS_PORT}`, {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const host = srcReq.get('host')
    if (typeof host === 'string' && proxyReqOpts.headers != null) {
      proxyReqOpts.headers.host = host
    }
    return proxyReqOpts
  },
  proxyReqPathResolver: (req: express.Request) => `/trpc${req.url}`,
}))
app.use('/auth/trpc', proxy(`localhost:${EXPRESS_PORT}`, {
  proxyReqPathResolver: (req: express.Request) => `/auth/trpc${req.url}`,
}))
app.use('/lnurl', proxy(`localhost:${LNURL_PORT}`, {
  proxyReqPathResolver: (req: express.Request) => `/lnurl${req.url}`,
}))
app.use('/', proxy(`localhost:${WEB_PORT}`))

app.listen(PROXY_PORT, () => {
  /* eslint-disable */
  console.info(`proxy running on ${PROXY_PORT}`)
})
