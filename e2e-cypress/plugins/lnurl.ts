/// <reference types="cypress" />

import LNURLAuth from '../../shared/src/modules/LNURL/LNURLAuth'

import { createRandomKeyPair } from '../lib/lnurlHelpers'

type GetLNURLAuthCallbackUrlParams =
  | { publicKeyAsHex: string; privateKeyAsHex: string; lnurlAuth?: string }
  | { lnurlAuth: string; publicKeyAsHex?: never; privateKeyAsHex?: never };

// This function is the entry point for plugins
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {

  on('task', {
    'lnurl:createRandomKeyPair': (): { publicKeyAsHex: string, privateKeyAsHex: string } => {
      return createRandomKeyPair()
    },

    'lnurl:getLNURLAuthCallbackUrl': async (params: GetLNURLAuthCallbackUrlParams): Promise<{ callbackUrl: string }> => {
      let keyPair: { publicKeyAsHex: string, privateKeyAsHex: string }
      if (params.privateKeyAsHex && params.publicKeyAsHex) {
        keyPair = {
          publicKeyAsHex: params.publicKeyAsHex,
          privateKeyAsHex: params.privateKeyAsHex,
        }
      } else {
        keyPair = createRandomKeyPair()
      }
      const lnurlAuth = new LNURLAuth(keyPair)
      return {
        callbackUrl: lnurlAuth.getLNURLAuthCallbackUrl(params.lnurlAuth).href,
      }
    },
  })

  return config
}
