// Since Cypress isn't fully compatible with tRPC and implementing automated login would require too much effort, we'll handle some backend calls directly here.

import { Router } from 'express'

import Auth from '@backend/domain/auth/Auth.js'

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

export default router
