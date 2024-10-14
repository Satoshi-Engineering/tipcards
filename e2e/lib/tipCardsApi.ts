import { login, isLoggedInViaCypress, isLoggedOut, refresh, clearAuth, createAndWrapLNURLAuth } from '@e2e/lib/api/auth'
import {
  fundCardWithInvoice,
  createInvoiceForCardHash,
  withdrawAllSatsFromCard,
} from '@e2e/lib/api/card'
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
  card: {
    fundCardWithInvoice,
    createInvoiceForCardHash,
    withdrawAllSatsFromCard,
  },
  generateAndAddRandomSet,
}
