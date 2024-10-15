import { login, isLoggedInViaCypress, isLoggedOut, refresh, clearAuth, createAndWrapLNURLAuth } from '@e2e/lib/api/auth'
import {
  fundCardWithInvoice,
  createInvoiceForCardHash,
  createLnurlpLinkForCardHash,
  createSharedFundingForCardHash,
  withdrawAllSatsFromCard,
} from '@e2e/lib/api/card'
import {
  generateAndAddRandomSet,
  createInvoiceForSet,
} from '@e2e/lib/api/set'

export default {
  auth: {
    login,
    refresh,
    isLoggedIn: isLoggedInViaCypress,
    isLoggedOut,
    clearAuth,
    createAndWrapLNURLAuth,
  },
  card: {
    fundCardWithInvoice,
    createInvoiceForCardHash,
    createLnurlpLinkForCardHash,
    createSharedFundingForCardHash,
    withdrawAllSatsFromCard,
  },
  set: {
    generateAndAddRandomSet,
    createInvoiceForSet,
  },
}
