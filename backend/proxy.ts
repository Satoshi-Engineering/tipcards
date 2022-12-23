import 'dotenv/config'
import proxy from 'express-http-proxy'
import express from 'express'

import {
  EXPRESS_PORT,
  LNURL_PORT,
  PROXY_PORT,
  WEB_PORT,
} from './src/constants'

const app = express()
app.use('/api', proxy(`localhost:${EXPRESS_PORT}`, {
  proxyReqPathResolver: (req: express.Request) => `/api${req.url}`,
}))
app.use('/socket.io', proxy(`localhost:${EXPRESS_PORT}`, {
  proxyReqPathResolver: (req: express.Request) => `/socket.io${req.url}`,
}))
app.use('/lnurl', proxy(`localhost:${LNURL_PORT}`, {
  proxyReqPathResolver: (req: express.Request) => `/lnurl${req.url}`,
}))
app.use('/', proxy(`localhost:${WEB_PORT}`))

app.listen(PROXY_PORT, () => {
  console.info(`proxy running on ${PROXY_PORT}`)
})
