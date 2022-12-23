import crypto from 'crypto'
import express from 'express'
import type http from 'http'
import lnurl from 'lnurl'
import { Server, Socket } from 'socket.io'

import { createJWT } from '../services/jwt'
import { TIPCARDS_ORIGIN, LNBITS_ADMIN_KEY } from '../constants'
import { LNBITS_ORIGIN } from '../../../src/constants'

/////
// LNURL SERVICE
const lnurlServer = lnurl.createServer({
  host: 'localhost',
  port: process.env.LNURL_PORT || 4001,
  url: process.env.TIPCARDS_API_ORIGIN || 'https://dev.tipcards.sate.tools',
  lightning: {
    backend: 'lnbits',
    config: {
      baseUrl: LNBITS_ORIGIN,
      adminKey: LNBITS_ADMIN_KEY,
    },
  },
})

type LoginEvent = {
  key: string,
  hash: string,
}
const loggedIn: Record<string, string> = {}
lnurlServer.on('login', async (event: LoginEvent) => {
  // `key` - the public key as provided by the LNURL wallet app
  // `hash` - the hash of the secret for the LNURL used to login
  const { key, hash } = event
  loggedIn[hash] = key

  if (socketsByHash[hash] != null) {
    const jwt = await createJWT(key)
    socketsByHash[hash].emit('loggedIn', {
      key,
      jwt,
    })
  }
})

/////
// SOCKET CONNECTION FOR AUTH
const socketsByHash: Record<string, Socket> = {}
const hashesBySocketId: Record<string, string> = {}
export const initSocketIo = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: (process.env.LNURL_AUTH_DEBUG === '1') ? '*' : TIPCARDS_ORIGIN,
    },
  })
  io.on('connection', (socket) => {
    socket.on('waitForLogin', async ({ hash }) => {
      socketsByHash[hash] = socket
      hashesBySocketId[socket.id] = hash
      if (typeof loggedIn[hash] === 'string') {
        const jwt = await createJWT(loggedIn[hash])
        socketsByHash[hash].emit('loggedIn', {
          key: loggedIn[hash],
          jwt,
        })
      }
    })
    socket.on('disconnect', () => {
      if (hashesBySocketId[socket.id] == null) {
        return
      }
      const hash = hashesBySocketId[socket.id]
      delete socketsByHash[hash]
      delete hashesBySocketId[socket.id]
    })
  })
}

/////
// ROUTES
const router = express.Router()
router.get('/create', async (req: express.Request, res: express.Response) => {
  const result = await lnurlServer.generateNewUrl('login')
  const secret = Buffer.from(result.secret, 'hex')
  const hash = crypto.createHash('sha256').update(secret).digest('hex')
  delete loggedIn[hash]
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
    const jwt = await createJWT(loggedIn[hash])
    res.json({
      status: 'success',
      data: {
        key: loggedIn[hash],
        jwt,
      },
    })
    return
  }
  res.status(403).json({
    status: 'error',
    data: 'not logged in',
  })
})
router.get('/debug', async (req: express.Request, res: express.Response) => {
  if (process.env.LNURL_AUTH_DEBUG !== '1') {
    res.status(403).json({
      status: 'error',
    })
    return
  }
  Object.keys(socketsByHash).forEach(async (hash) => {
    const key = 'debugKey'
    const jwt = await createJWT(key)
    socketsByHash[hash].emit('loggedIn', { key, jwt })
  })
  res.json({
    status: 'success',
  })
})

export default router
