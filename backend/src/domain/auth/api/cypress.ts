// Since Cypress isn't fully compatible with tRPC and implementing automated login would require too much effort, we'll handle some backend calls directly here.

import { Router } from 'express'
import cookieParser from 'cookie-parser'

import HDWallet from '@shared/modules/HDWallet/HDWallet.js'
import { ErrorCode } from '@shared/data/Errors.js'

import Auth from '@backend/domain/auth/Auth.js'
import { getUserById, updateUser } from '@backend/database/deprecated/queries.js'

const router = Router()

/////
// LnurlAuth
//

router.get('/lnurlAuth/create', async (_, res) => {
  const lnurlAuthLogin = Auth.getAuth().getLnurlAuthLogin()
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

router.get('/loginWithLnurlAuthHash/:hash', async (req, res) => {
  const hash = req.params.hash
  const result = await Auth.getAuth().loginWithLnurlAuthHash(hash)
  res
    .cookie('refresh_token', result.refreshToken, {
      expires: new Date(+ new Date() + 1000 * 60 * 60 * 24 * 365),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    .json({
      status: 'success',
      data: { accessToken: result.accessToken },
    })
})


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

router.get('/createRandomPublicPrivateKeyPairAsHex', async (_, res) => {
  const randomMnemonic = HDWallet.generateRandomMnemonic()
  const hdWallet = new HDWallet(randomMnemonic)
  const signingKey = hdWallet.getNodeAtPath(0, 0, 0)

  res.json({
    status: 'success',
    data: {
      publicKeyAsHex: signingKey.getPublicKeyAsHex(),
      privateKeyAsHex: signingKey.getPrivateKeyAsHex(),
    },
  })
})

export default router
