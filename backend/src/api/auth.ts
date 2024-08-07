import { createHash } from 'crypto'
import { Router } from 'express'
import type http from 'http'
import { exportSPKI } from 'jose'
import lnurl from 'lnurl'
import { Server, Socket } from 'socket.io'
import cookieParser from 'cookie-parser'

import { Profile } from '@shared/data/auth/User.js'
import { ErrorCode } from '@shared/data/Errors.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import corsOptions from '@backend/services/corsOptions.js'
import { getUserByLnurlAuthKeyOrCreateNew, getUserById, updateUser } from '@backend/database/deprecated/queries.js'
import {
  getPublicKey,
  createAccessToken, createRefreshToken,
} from '@backend/services/jwt.js'
import {
  LNURL_PORT, LNURL_SERVICE_ORIGIN,
  LNBITS_ORIGIN, LNBITS_ADMIN_KEY,
  LNURL_AUTH_DEBUG,
} from '@backend/constants.js'

import { authGuardRefreshToken, cycleRefreshToken } from './middleware/auth/jwt.js'

/////
// LNURL SERVICE
type LoginEvent = {
  key: string,
  hash: string,
}
const loggedIn: Record<string, string> = {}

const lnurlServer = lnurl.createServer({
  host: '0.0.0.0',
  port: LNURL_PORT,
  url: LNURL_SERVICE_ORIGIN,
  lightning: {
    backend: 'lnbits',
    config: {
      baseUrl: LNBITS_ORIGIN,
      adminKey: LNBITS_ADMIN_KEY,
    },
  },
})
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

  socketsByHash[hash].emit('loggedIn')
})

/////
// SOCKET CONNECTION FOR AUTH
const socketsByHash: Record<string, Socket> = {}
const hashesBySocketId: Record<string, string> = {}
export const initSocketIo = (server: http.Server) => {
  const io = new Server(server, {
    cors: LNURL_AUTH_DEBUG ? { origin: '*' } : corsOptions,
  })
  io.on('connection', (socket) => {
    socket.on('waitForLogin', async ({ hash }) => {
      socketsByHash[hash] = socket
      hashesBySocketId[socket.id] = hash
      if (typeof loggedIn[hash] !== 'string') {
        return
      }
      socketsByHash[hash].emit('loggedIn')
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
const router = Router()

router.get('/publicKey', async (_, res) => {
  const publicKey = await getPublicKey()
  const spkiPem = await exportSPKI(publicKey)
  res.json({
    status: 'success',
    data: spkiPem,
  })
})

router.get('/create', async (_, res) => {
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

router.get('/status/:hash', async (req, res) => {
  const hash = req.params.hash
  if (loggedIn[hash] == null) {
    res.status(404).json({
      status: 'error',
      message: 'Hash not found.',
    })
    return
  }
  if (typeof loggedIn[hash] !== 'string') {
    res.status(403).json({
      status: 'error',
      message: 'No log in happened for given hash.',
    })
    return
  }

  let user: User
  try {
    user = await getUserByLnurlAuthKeyOrCreateNew(loggedIn[hash])
  } catch (error) {
    console.error(ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey, error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to get or create user.',
      code: ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey,
    })
    return
  }

  const refreshToken = await createRefreshToken(user)
  if (user.allowedRefreshTokens == null) {
    user.allowedRefreshTokens = []
  }
  user.allowedRefreshTokens.push([refreshToken])

  try {
    await updateUser(user)
  } catch (error) {
    console.error(ErrorCode.UnableToUpdateUser, error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to update user authentication.',
      code: ErrorCode.UnableToUpdateUser,
    })
    return
  }

  const accessToken = await createAccessToken(user)
  res
    .cookie('refresh_token', refreshToken, {
      expires: new Date(+ new Date() + 1000 * 60 * 60 * 24 * 365),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    .json({
      status: 'success',
      data: { accessToken },
    })
  delete loggedIn[hash]
})

router.get(
  '/refresh',
  cookieParser(),
  authGuardRefreshToken,
  cycleRefreshToken,
  async (_, res) => {
    const { userId } = res.locals

    try {
      const user = await getUserById(userId)
      if (user == null) {
        res.status(404).json({
          status: 'error',
          data: 'User not found.',
        })
        return
      }
      const accessToken = await createAccessToken(user)
      res.json({
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
  },
)

router.post('/logout', cookieParser(), async (req, res) => {
  const oldRefreshToken = req.cookies?.refresh_token
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })
  if (oldRefreshToken != null) {
    try {
      const { id } = JSON.parse(atob(oldRefreshToken.split('.')[1]))
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

router.post(
  '/logoutAllOtherDevices',
  cookieParser(),
  authGuardRefreshToken,
  cycleRefreshToken,
  async (req, res) => {
    try {
      const { userId } = res.locals
      const user = await getUserById(userId)
      if (user?.allowedRefreshTokens != null) {
        user.allowedRefreshTokens = user.allowedRefreshTokens
          .filter((currentRefreshTokens) => currentRefreshTokens.includes(req.cookies?.refresh_token))
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
    res.json({ status: 'success' })
  },
)

router.get(
  '/profile',
  cookieParser(),
  authGuardRefreshToken,
  cycleRefreshToken,
  async (_, res) => {
    try {
      const { userId } = res.locals
      const user = await getUserById(userId)
      res.json({
        status: 'success',
        data: Profile.parse(user?.profile),
      })
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(403).json({
        status: 'error',
        data: 'unknown database error',
      })
      return
    }
  },
)

router.post(
  '/profile',
  cookieParser(),
  authGuardRefreshToken,
  cycleRefreshToken,
  async (req, res) => {
    const parseResult  = Profile.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({
        status: 'error',
        data: parseResult.error,
      })
      return
    }
    const { data: profile } = parseResult
    try {
      const { userId } = res.locals
      const user = await getUserById(userId)
      if (user == null) {
        res.status(404).json({
          status: 'error',
          data: 'user not found',
        })
        return
      }
      user.profile = profile
      await updateUser(user)
      res.json({
        status: 'success',
        data: profile,
      })
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(403).json({
        status: 'error',
        data: 'unknown database error',
      })
      return
    }
  },
)

export default router
