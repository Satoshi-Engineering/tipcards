/// <reference types="cypress" />

import HDWallet from '../../shared/src/modules/HDWallet/HDWallet.js'

// This function is the entry point for plugins
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('task', {
    'lnurl:createRandomKeyPair': async (): Promise<{ publicKeyAsHex: string, privateKeyAsHex: string }> => {
      const randomMnemonic = HDWallet.generateRandomMnemonic()
      const hdWallet = new HDWallet(randomMnemonic)
      const signingKey = hdWallet.getNodeAtPath(0, 0, 0)

      return {
        publicKeyAsHex: signingKey.getPublicKeyAsHex(),
        privateKeyAsHex: signingKey.getPrivateKeyAsHex(),
      }
    },
  })

  return config
}
