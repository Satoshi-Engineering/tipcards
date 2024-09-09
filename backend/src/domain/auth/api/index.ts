import { Router } from 'express'

import Auth from '@backend/domain/auth/Auth.js'

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
