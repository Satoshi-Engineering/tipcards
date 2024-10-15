import { Router } from 'express'

import Auth from '@auth/domain/Auth.js'

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

export default router
