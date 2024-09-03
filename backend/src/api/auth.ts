import { Router } from 'express'
import cookieParser from 'cookie-parser'

import { ErrorCode } from '@shared/data/Errors.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import { getUserByLnurlAuthKeyOrCreateNew, getUserById, updateUser } from '@backend/database/deprecated/queries.js'
import {
  createAccessToken, createRefreshToken,
} from '@backend/services/jwt.js'
import Auth from '@backend/domain/auth/Auth.js'
import LoginInformer from '@backend/domain/auth/LoginInformer.js'
import SocketIoServer from '@backend/services/SocketIoServer.js'
import LnurlServer from '@backend/services/LnurlServer.js'
import LnurlAuthLogin from '@backend/domain/auth/LnurlAuthLogin.js'

import { authGuardRefreshToken, cycleRefreshToken } from './middleware/auth/jwt.js'

/////
// LNURL AUTH LOGIN

let lnurlAuthLogin: null | LnurlAuthLogin

export const apiStartup = () => {
  const loginInformer = new LoginInformer(SocketIoServer.getServer())
  lnurlAuthLogin = new LnurlAuthLogin(
    LnurlServer.getServer(),
    loginInformer,
  )
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
  if (lnurlAuthLogin == null) {
    res.json({
      status: 'error',
      message: 'LnurlAuthLogin not initialized.',
    }).status(500)
    return
  }

  const result = await lnurlAuthLogin.create()

  res.json({
    status: 'success',
    data: {
      encoded: result.lnurlAuth,
      hash: result.hash,
    },
  })
})

router.get('/status/:hash', async (req, res) => {
  const hash = req.params.hash
  if (lnurlAuthLogin == null || !lnurlAuthLogin.isOneTimeLoginHashValid(hash)) {
    res.status(404).json({
      status: 'error',
      message: 'Hash not found.',
    })
    return
  }
  const walletPublicKey = lnurlAuthLogin.getPublicKeyFromOneTimeLoginHash(hash)

  if (typeof walletPublicKey !== 'string' || walletPublicKey.length === 0) {
    res.status(403).json({
      status: 'error',
      message: 'No log in happened for given hash.',
    })
    return
  }

  let user: User
  try {
    user = await getUserByLnurlAuthKeyOrCreateNew(walletPublicKey)
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
  lnurlAuthLogin?.invalidateLoginHash(hash)
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
