import { createHash } from 'crypto'
import express from 'express'
import type http from 'http'
import lnurl from 'lnurl'
import { Server, Socket } from 'socket.io'

import { getUserByLnurlAuthKeyOrCreateNew } from '../services/database'
import { createJWT } from '../services/jwt'
import { ErrorCode } from '../../../src/data/Errors'
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

  if (socketsByHash[hash] == null) {
    return
  }

  try {
    const user = await getUserByLnurlAuthKeyOrCreateNew(key)
    const jwt = await createJWT(user)
    socketsByHash[hash].emit('loggedIn', { jwt })
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    socketsByHash[hash].emit('error')
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
      if (typeof loggedIn[hash] !== 'string') {
        return
      }
      try {
        const user = await getUserByLnurlAuthKeyOrCreateNew(loggedIn[hash])
        const jwt = await createJWT(user)
        socketsByHash[hash].emit('loggedIn', { jwt })
      } catch (error) {
        console.error(ErrorCode.UnknownDatabaseError, error)
        socketsByHash[hash].emit('error')
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
  const hash = createHash('sha256').update(secret).digest('hex')
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
  if (typeof loggedIn[hash] !== 'string') {
    res.status(403).json({
      status: 'error',
      data: 'not logged in',
    })
    return
  }
  try {
    const user = await getUserByLnurlAuthKeyOrCreateNew(loggedIn[hash])
    const jwt = await createJWT(user)
    res.json({
      status: 'success',
      data: {
        key: loggedIn[hash],
        jwt,
      },
    })
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(403).json({
      status: 'error',
      data: 'unknown database error',
    })
  }
})
router.get('/debug', async (req: express.Request, res: express.Response) => {
  if (process.env.LNURL_AUTH_DEBUG !== '1') {
    res.status(403).json({
      status: 'error',
    })
    return
  }
  Object.keys(socketsByHash).forEach(async (hash) => {
    if (req.query.error != null) {
      socketsByHash[hash].emit('error')
      return
    }
    const key = 'debugKey'
    loggedIn[hash] = key
    try {
      const user = await getUserByLnurlAuthKeyOrCreateNew(key)
      const jwt = await createJWT(user)
      socketsByHash[hash].emit('loggedIn', { jwt })
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      socketsByHash[hash].emit('error')
    }
  })
  res.json({
    status: 'success',
  })
})

export default router
