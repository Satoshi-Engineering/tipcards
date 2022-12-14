import crypto from 'crypto'
import express from 'express'
import lnurl from 'lnurl'

import { LNBITS_ADMIN_KEY } from '../constants'
import { LNBITS_ORIGIN } from '../../../src/constants'

/////
// LNURL SERVICE
const LNURL_PORT = process.env.LNURL_PORT || 4002
const LNURL_ORIGIN = process.env.LNURL_ORIGIN || 'https://auth.dev.tipcards.sate.tools'
const backend = 'lnbits'
const config = {
	baseUrl: LNBITS_ORIGIN,
	adminKey: LNBITS_ADMIN_KEY,
}
const lnurlServer = lnurl.createServer({
  host: 'localhost',
  port: LNURL_PORT,
  url: LNURL_ORIGIN,
  lightning: {
    backend,
    config,
  },
})

type LoginEvent = {
  key: string,
  hash: string,
}
const loggedIn: Record<string, string | boolean> = {}
lnurlServer.on('login', (event: LoginEvent) => {
  // `key` - the public key as provided by the LNURL wallet app
  // `hash` - the hash of the secret for the LNURL used to login
  const { key, hash } = event
  loggedIn[hash] = key
})

/////
// ROUTES
const router = express.Router()
router.get('/create', async (req: express.Request, res: express.Response) => {
  const result = await lnurlServer.generateNewUrl('login')
  const secret = Buffer.from(result.secret, 'hex')
  const hash = crypto.createHash('sha256').update(secret).digest('hex')
  loggedIn[hash] = false
  res.json({
    status: 'success',
    data: {
      encoded: result.encoded,
      hash,
    },
  })
})
router.get('/status/:hash', async (req: express.Request, res: express.Response) => {
  const hash = req.params.hash
  if (loggedIn[hash] == null) {
    res.status(404).json({
      status: 'error',
      data: 'not found',
    })
    return
  }
  if (typeof loggedIn[hash] === 'string') {
    res.json({
      status: 'success',
      data: loggedIn[hash],
    })
    return
  }
  res.status(403).json({
    status: 'error',
    data: 'not logged in',
  })
})

export default router
