import {
  login,
  isLoggedInViaCypress,
  isLoggedOut,
  refresh,
  clearAuth,
  createAndWrapLNURLAuth,
  wrapLNURLAuth,
  logoutAllDevices,
} from '@e2e/lib/api/auth'
import { startBulkWithdraw } from '@e2e/lib/api/bulkWithdraw'
import {
  fundCardWithInvoice,
  createInvoiceForCardHash,
  createLnurlpLinkForCardHash,
  createSharedFundingForCardHash,
  withdrawAllSatsFromCard,
  callWithdrawUsedHookForCard,
  useFundedCard,
  useLnurlWithdraw,
} from '@e2e/lib/api/card'
import {
  generateAndAddRandomSet,
  createInvoiceForSet,
  fundSet,
  addSet,
  addSetsParallel,
  createInvoicesForSetsParallel,
} from '@e2e/lib/api/set'

export default {
  auth: {
    login,
    refresh,
    isLoggedIn: isLoggedInViaCypress,
    isLoggedOut,
    clearAuth,
    createAndWrapLNURLAuth,
    wrapLNURLAuth,
    logoutAllDevices,
  },
  bulkWithdraw: {
    startBulkWithdraw,
  },
  card: {
    fundCardWithInvoice,
    createInvoiceForCardHash,
    createLnurlpLinkForCardHash,
    createSharedFundingForCardHash,
    withdrawAllSatsFromCard,
    callWithdrawUsedHookForCard,
    useFundedCard,
    useLnurlWithdraw,
  },
  set: {
    generateAndAddRandomSet,
    createInvoiceForSet,
    fundSet,
    addSet,
    addSetsParallel,
    createInvoicesForSetsParallel,
  },
}
