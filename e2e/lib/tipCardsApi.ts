import { login, isLoggedInViaCypress, isLoggedOut, refresh, clearAuth, createAndWrapLNURLAuth } from '@e2e/lib/api/auth'
import { createInvoiceForCardHash, withdrawAllSatsFromCard } from '@e2e/lib/api/card'
import { payInvoice } from '@e2e/lib/api/lnbitsWallet'
import { generateAndAddRandomSet } from '@e2e/lib/api/sets'

export default {
  auth: {
    login,
    refresh,
    isLoggedIn: isLoggedInViaCypress,
    isLoggedOut,
    clearAuth,
    createAndWrapLNURLAuth,
  },
  lnbitsWallet: {
    payInvoice,
  },
  createInvoiceForCardHash,
  withdrawAllSatsFromCard,
  generateAndAddRandomSet,
}
