import { createHash } from 'crypto'
import express from 'express'
import type http from 'http'
import lnurl from 'lnurl'
import { Server, Socket } from 'socket.io'
import cookieParser from 'cookie-parser'

import { getUserByLnurlAuthKeyOrCreateNew, getUserById, updateUser } from '../services/database'
import { createAccessToken, createRefreshToken, authGuardRefreshToken } from '../services/jwt'
import { LNBITS_ORIGIN } from '../constants'

import { ErrorCode } from '../../../src/data/Errors'
import { TIPCARDS_ORIGIN, LNBITS_ADMIN_KEY } from '../constants'

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
  setTimeout(() => {
    delete loggedIn[hash]
  }, 1000 * 60 * 15)

  if (socketsByHash[hash] == null) {
    return
  }

  try {
    socketsByHash[hash].emit('loggedIn')
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
        socketsByHash[hash].emit('loggedIn')
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
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 28)
    const user = await getUserByLnurlAuthKeyOrCreateNew(loggedIn[hash])
    const refreshToken = await createRefreshToken(user, expires)
    const accessToken = await createAccessToken(user)
    if (user.allowedRefreshTokens == null) {
      user.allowedRefreshTokens = []
    }
    user.allowedRefreshTokens.push([refreshToken])
    await updateUser(user)
    res
      .cookie('refresh_token', refreshToken, {
        expires,
        httpOnly: true,
        secure: true,
        sameSite: true,
      })
      .json({
        status: 'success',
        data: { accessToken },
      })
    delete loggedIn[hash]
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(403).json({
      status: 'error',
      data: 'unknown database error',
    })
  }
})

router.get('/refresh', cookieParser(), authGuardRefreshToken, async (req: express.Request, res: express.Response) => {
  const { id } = res.locals.refreshTokenPayload
  try {
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 28)
    const user = await getUserById(id)
    if (user == null) {
      res.status(404).json({
        status: 'error',
        data: 'User not found.',
      })
      return
    }
    const refreshToken = await createRefreshToken(user, expires)
    const accessToken = await createAccessToken(user)
    if (user.allowedRefreshTokens == null) {
      user.allowedRefreshTokens = []
    }
    const oldRefreshToken = req.cookies?.refresh_token
    user.allowedRefreshTokens = user.allowedRefreshTokens.map((currentRefreshTokens) => {
      if (!currentRefreshTokens.includes(oldRefreshToken)) {
        return currentRefreshTokens
      }
      if (currentRefreshTokens.length === 1) {
        return [...currentRefreshTokens, refreshToken]
      }
      return [currentRefreshTokens[currentRefreshTokens.length - 1], refreshToken]
    })
    await updateUser(user)
    res
      .cookie('refresh_token', refreshToken, {
        expires,
        httpOnly: true,
        secure: true,
        sameSite: true,
      })
      .json({
        status: 'success',
        data: { accessToken },
      })
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(403).json({
      status: 'error',
      data: 'unknown database error',
    })
  }
})

router.post('/logout', cookieParser(), async (req: express.Request, res: express.Response) => {
  const oldRefreshToken = req.cookies?.refresh_token
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: true,
    sameSite: true,
  })
  if (oldRefreshToken != null) {
    try {
      const { id } = JSON.parse(atob(oldRefreshToken.value.split('.')[1]))
      const user = await getUserById(id)
      if (user?.allowedRefreshTokens != null) {
        user.allowedRefreshTokens = user.allowedRefreshTokens
          .filter((currentRefreshTokens) => !currentRefreshTokens.includes(oldRefreshToken))
        await updateUser(user)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(403).json({
        status: 'error',
        data: 'unknown database error',
      })
      return
    }
  }
  res.json({ status: 'success' })
})

router.post('/logoutAllOtherDevices', cookieParser(), authGuardRefreshToken, async (req: express.Request, res: express.Response) => {
  const oldRefreshToken = req.cookies?.refresh_token
  if (oldRefreshToken != null) {
    try {
      const { id } = JSON.parse(atob(oldRefreshToken.value.split('.')[1]))
      const user = await getUserById(id)
      if (user?.allowedRefreshTokens != null) {
        user.allowedRefreshTokens = user.allowedRefreshTokens
          .filter((currentRefreshTokens) => currentRefreshTokens.includes(oldRefreshToken))
        await updateUser(user)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(403).json({
        status: 'error',
        data: 'unknown database error',
      })
      return
    }
  }
  res.json({ status: 'success' })
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
      socketsByHash[hash].emit('loggedIn')
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
