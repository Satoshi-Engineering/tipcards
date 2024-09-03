import { createHash } from 'crypto'
import { Router } from 'express'
import cookieParser from 'cookie-parser'
import lnurl from 'lnurl'

import { ErrorCode } from '@shared/data/Errors.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import { getUserByLnurlAuthKeyOrCreateNew, getUserById, updateUser } from '@backend/database/deprecated/queries.js'
import {
  createAccessToken, createRefreshToken,
} from '@backend/services/jwt.js'
import Auth from '@backend/domain/auth/Auth.js'
import LoginInformer from '@backend/domain/auth/LoginInformer.js'
import SocketIoServer from '@backend/services/SocketIoServer.js'
import LnurlServer, { type LoginEvent } from '@backend/services/LnurlServer.js'

import { authGuardRefreshToken, cycleRefreshToken } from './middleware/auth/jwt.js'

/////
// LNURL SERVICE

let loginInformer: null | LoginInformer
let lnurlServer: null | lnurl.LnurlServer

export const apiStartup = () => {
  loginInformer = new LoginInformer(SocketIoServer.getServer())
  lnurlServer = LnurlServer.getServer()
  lnurlServer.on('login', async (event: LoginEvent) => {
    // `key` - the public key as provided by the LNURL wallet app
    // `hash` - the hash of the secret for the LNURL used to login
    const { key, hash } = event
    addOneTimeLoginKey(hash, key)
    setTimeout(() => {
      removeOneTimeLoginKey(hash)
    }, 1000 * 60 * 15)
    loginInformer?.emitLoginSuccessfull(hash)
  })
}

const oneTimeLoginKey: Record<string, string> = {}

const addOneTimeLoginKey = (hash: string, key: string) => {
  oneTimeLoginKey[hash] = key
  loginInformer?.addLoginHash(hash)
}

const removeOneTimeLoginKey = (hash: string) => {
  delete oneTimeLoginKey[hash]
  loginInformer?.removeLoginHash(hash)
}

/////
// ROUTES
const router = Router()

router.get('/publicKey', async (_, res) => {
  const spkiPem = await Auth.getPublicKey()
  res.json({
    status: 'success',
    data: spkiPem,
  })
})

router.get('/create', async (_, res) => {
  if (lnurlServer == null) {
    res.json({
      status: 'error',
      message: 'Lnurl server not initialized.',
    }).status(500)
    return
  }

  const result = await lnurlServer.generateNewUrl('login')
  const secret = Buffer.from(result.secret, 'hex')
  const hash = createHash('sha256').update(secret).digest('hex')
  removeOneTimeLoginKey(hash)
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
  if (oneTimeLoginKey[hash] == null) {
    res.status(404).json({
      status: 'error',
      message: 'Hash not found.',
    })
    return
  }
  if (typeof oneTimeLoginKey[hash] !== 'string') {
    res.status(403).json({
      status: 'error',
      message: 'No log in happened for given hash.',
    })
    return
  }

  let user: User
  try {
    user = await getUserByLnurlAuthKeyOrCreateNew(oneTimeLoginKey[hash])
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
  removeOneTimeLoginKey(hash)
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

export default router
