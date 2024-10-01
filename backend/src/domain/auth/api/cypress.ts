import { Router } from 'express'

import HDWallet from '@shared/modules/HDWallet/HDWallet.js'

const router = Router()

// Due to the numerous errors caused by importing the crypto libraries in the Cypress controlled browser, the private/public key generation was shifted to the backend.
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
